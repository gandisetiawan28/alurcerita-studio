import sys
import os
import json
import time
import shutil
import numpy as np
import torch
import soundfile as sf

def main():
    input_json_path = os.environ.get("INPUT_JSON")
    if not input_json_path:
        # Check sys.argv only if not IPython runtime args
        args = [a for a in sys.argv[1:] if not a.startswith('-') and not a.endswith('.json')]
        if args:
            input_json_path = args[0]
    if not input_json_path:
        input_json_path = "/tmp/tts_input.json"
        
    if not os.path.exists(input_json_path):
        print(json.dumps({"type": "error", "message": f"Input file not found: {input_json_path}"}), flush=True)
        sys.exit(1)
        
    with open(input_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    sentences = data.get("sentences", [])
    voice = data.get("voice", "am_adam")
    speed = float(data.get("speed", 1.1))
    output_id = data.get("output_id", str(int(time.time())))
    
    if not sentences:
        print(json.dumps({"type": "error", "message": "No sentences provided"}), flush=True)
        sys.exit(1)

    total_sentences = len(sentences)
    print(json.dumps({"type": "init", "total": total_sentences}), flush=True)

    # Initialize Kokoro
    from kokoro import KPipeline
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    pipeline = KPipeline(lang_code='a', device=device)
    
    sample_rate = 24000
    silence_sec = 0.25 # 250ms natural breathing pause between sentences
    silence_arr = np.zeros(int(sample_rate * silence_sec), dtype=np.float32)

    chunks_dir = f"/tmp/audio_chunks_{output_id}"
    os.makedirs(chunks_dir, exist_ok=True)
    
    all_audio_parts = []
    
    for idx, text in enumerate(sentences):
        print(json.dumps({"type": "sentence_start", "index": idx, "text": text}), flush=True)
        t0 = time.time()
        
        try:
            generator = pipeline(text, voice=voice, speed=speed, split_pattern=r'\n+')
            sentence_audio = []
            for gs, ps, audio in generator:
                if isinstance(audio, torch.Tensor):
                    audio = audio.cpu().numpy()
                sentence_audio.append(audio)
                
            if sentence_audio:
                sentence_full = np.concatenate(sentence_audio) if len(sentence_audio) > 1 else sentence_audio[0]
            else:
                sentence_full = np.zeros(int(sample_rate * 0.4), dtype=np.float32)
        except Exception as e:
            # Fallback on short silence if single sentence fails
            sentence_full = np.zeros(int(sample_rate * 0.5), dtype=np.float32)
            
        chunk_path = f"{chunks_dir}/chunk_{idx}.wav"
        sf.write(chunk_path, sentence_full, sample_rate)
        duration = len(sentence_full) / sample_rate
        elapsed = time.time() - t0
        
        all_audio_parts.append(sentence_full)
        if idx < total_sentences - 1:
            all_audio_parts.append(silence_arr)
            
        print(json.dumps({
            "type": "sentence_done",
            "index": idx,
            "duration": round(duration, 2),
            "elapsed": round(elapsed, 2)
        }), flush=True)

    # Merge all audio parts into one complete master audio
    merged_audio = np.concatenate(all_audio_parts)
    merged_wav = f"/tmp/merged_{output_id}.wav"
    merged_mp3 = f"/tmp/merged_{output_id}.mp3"
    sf.write(merged_wav, merged_audio, sample_rate)

    # Convert to MP3 using ffmpeg if available
    has_ffmpeg = shutil.which("ffmpeg") is not None
    if has_ffmpeg:
        os.system(f"ffmpeg -y -i {merged_wav} -b:a 192k {merged_mp3} > /dev/null 2>&1")
        final_output = merged_mp3 if os.path.exists(merged_mp3) else merged_wav
        output_format = "mp3" if os.path.exists(merged_mp3) else "wav"
    else:
        final_output = merged_wav
        output_format = "wav"

    total_duration = len(merged_audio) / sample_rate
    print(json.dumps({
        "type": "complete",
        "final_file": final_output,
        "format": output_format,
        "total_duration": round(total_duration, 2),
        "total_sentences": total_sentences,
        "output_id": output_id
    }), flush=True)

if __name__ == '__main__':
    main()
