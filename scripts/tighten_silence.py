"""
Audio Silence Tightener for AlurCerita Studio.
Detects long gaps between sentences (e.g. >= 0.48s caused by TTS sentence pauses)
and reduces them to a natural, tight storytelling gap (e.g. 0.18s) with micro-crossfades.
Preserves intra-sentence natural breath/comma pauses (< 0.48s) completely.
"""

import os
import sys
import argparse
import subprocess
import soundfile as sf
import numpy as np


def detect_silences(input_path: str, noise_thresh: str = '-30dB', min_detect_dur: float = 0.3):
    """Run ffmpeg silencedetect and extract (start, end, duration) tuples."""
    cmd = [
        'ffmpeg', '-v', 'info',
        '-i', input_path,
        '-af', f'silencedetect=noise={noise_thresh}:d={min_detect_dur}',
        '-f', 'null', '-'
    ]
    p = subprocess.run(cmd, capture_output=True, text=True)

    silences = []
    cur_start = None
    for line in p.stderr.splitlines():
        if 'silence_start:' in line:
            try:
                cur_start = float(line.split('silence_start:')[1].strip())
            except Exception:
                cur_start = None
        elif 'silence_end:' in line:
            try:
                parts = line.split('silence_end:')[1].split('|')
                end = float(parts[0].strip())
                dur = float(parts[1].split('silence_duration:')[1].strip())
                if cur_start is not None:
                    silences.append((cur_start, end, dur))
            except Exception:
                pass
            cur_start = None

    return silences


def tighten_audio(
    input_path: str,
    output_wav: str,
    output_mp3: str = None,
    min_silence_dur: float = 0.48,
    target_gap: float = 0.18,
    pad_head: float = 0.08,
    pad_tail: float = 0.10,
    noise_thresh: str = '-30dB'
):
    print(f"🔍 Menganalisis jeda hening pada file: {input_path}...")
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"File tidak ditemukan: {input_path}")

    all_silences = detect_silences(input_path, noise_thresh=noise_thresh, min_detect_dur=0.3)
    long_silences = [(s, e, d) for (s, e, d) in all_silences if d >= min_silence_dur]

    print(f"📊 Total jeda terdeteksi: {len(all_silences)}")
    print(f"🎯 Jeda antar-kalimat panjang (>= {min_silence_dur}s): {len(long_silences)} titik")

    if not long_silences:
        print("ℹ️ Tidak ditemukan jeda antar-kalimat yang melebihi batas. Menyalin file langsung.")
        import shutil
        shutil.copy2(input_path, output_wav)
        return

    # Calculate statistics
    total_reduction = sum((d - target_gap) for (_, _, d) in long_silences if d > target_gap)
    avg_pause_before = sum(d for (_, _, d) in long_silences) / len(long_silences)

    print(f"⏱️ Rata-rata jeda sebelum diperbaiki : {avg_pause_before:.2f} detik")
    print(f"⚡ Target jeda setelah diperbaiki  : {target_gap:.2f} detik")
    print(f"✂️ Total waktu hening yang dipangkas : {total_reduction:.1f} detik (~{total_reduction/60:.1f} menit)")

    print(f"⏳ Membaca data audio ke memory (soundfile)...")
    data, sr = sf.read(input_path)
    orig_duration = len(data) / sr
    is_multichannel = (len(data.shape) > 1)

    print(f"📻 Format: {sr} Hz, {'Stereo' if is_multichannel else 'Mono'}, Durasi Asli: {orig_duration:.1f}s ({orig_duration/60:.1f} menit)")

    # 5ms crossfade in samples
    fade_len = int(sr * 0.005)
    fade_out = np.linspace(1.0, 0.0, fade_len)
    fade_in = np.linspace(0.0, 1.0, fade_len)
    if is_multichannel:
        fade_out = fade_out[:, np.newaxis]
        fade_in = fade_in[:, np.newaxis]

    keep_segments = []
    prev_idx = 0
    cuts_count = 0

    for s, e, d in long_silences:
        # Keep speech + natural decay pad
        cut_start = int((s + pad_head) * sr)
        # Skip dead air, resume with natural attack pad
        cut_end = int((e - pad_tail) * sr)

        if cut_start > prev_idx and cut_end > cut_start:
            seg = data[prev_idx:cut_start].copy()
            # Apply fade out at end of segment if long enough
            if len(seg) >= fade_len:
                seg[-fade_len:] *= fade_out
            keep_segments.append(seg)

            # Apply fade in to the upcoming segment at cut_end
            if cut_end + fade_len <= len(data):
                data[cut_end:cut_end+fade_len] *= fade_in

            prev_idx = cut_end
            cuts_count += 1

    # Append trailing segment
    if prev_idx < len(data):
        keep_segments.append(data[prev_idx:])

    print(f"🔗 Menggabungkan {len(keep_segments)} segmen audio bersih ({cuts_count} titik dipotong)...")
    output_data = np.concatenate(keep_segments, axis=0)
    new_duration = len(output_data) / sr

    print(f"💾 Menyimpan WAV master ke: {output_wav}")
    os.makedirs(os.path.dirname(os.path.abspath(output_wav)), exist_ok=True)
    sf.write(output_wav, output_data, sr)

    if output_mp3:
        print(f"🎵 Mengonversi MP3 high-quality (192kbps) ke: {output_mp3}")
        os.makedirs(os.path.dirname(os.path.abspath(output_mp3)), exist_ok=True)
        subprocess.run(
            ['ffmpeg', '-y', '-i', output_wav, '-c:a', 'libmp3lame', '-b:a', '192k', output_mp3],
            capture_output=True, check=True
        )

    print("\n" + "="*50)
    print("✅ PROSES SELESAI DENGAN SUKSES!")
    print(f"⏱️ Durasi Awal    : {orig_duration:.1f}s ({int(orig_duration//60)}m {int(orig_duration%60)}s)")
    print(f"🚀 Durasi Baru    : {new_duration:.1f}s ({int(new_duration//60)}m {int(new_duration%60)}s)")
    print(f"🎯 Efisiensi Dead Air Terpangkas : {orig_duration - new_duration:.1f}s ({int((orig_duration - new_duration)//60)}m {int((orig_duration - new_duration)%60)}s)")
    print("="*50)


def main():
    parser = argparse.ArgumentParser(description="AlurCerita Audio Silence Tightener")
    parser.add_argument("--input", "-i", required=True, help="Input WAV/MP3 audio path")
    parser.add_argument("--output-wav", "-o", required=True, help="Output tightened WAV path")
    parser.add_argument("--output-mp3", "-m", help="Optional output tightened MP3 path")
    parser.add_argument("--target-gap", "-t", type=float, default=0.18, help="Target sentence gap in seconds (default: 0.18)")
    parser.add_argument("--min-silence", "-s", type=float, default=0.48, help="Threshold to consider a pause as sentence boundary (default: 0.48)")

    args = parser.parse_args()
    tighten_audio(
        input_path=args.input,
        output_wav=args.output_wav,
        output_mp3=args.output_mp3,
        min_silence_dur=args.min_silence,
        target_gap=args.target_gap
    )


if __name__ == "__main__":
    main()
