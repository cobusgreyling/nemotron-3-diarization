<p align="center">
  <img src="assets/header.jpg" alt="Overlapping lime and teal voice waveforms" width="100%" />
</p>

# Nemotron 3 Diarization — Showcase + Colab lab

I could download the NVIDIA **Nemotron 3 Diarization** preview. This machine has **no GPU**, so the checkpoint runs in **Google Colab (T4)** with a **Gradio UI** attached to the notebook. This repo is the showcase, the overlapping-voices lab, and that notebook.

**Read the 3-minute post → [`BLOG.md`](BLOG.md)**

> **Embargo:** private until **23 Sep 2026, 08:00 PT**. Do not flip public. See [`EMBARGO.md`](EMBARGO.md). The `.nemo` weights are **not** in git.

## 30-second start (this Mac, Demo mode)

```bash
git clone https://github.com/cobusgreyling/nemotron-3-diarization.git
cd nemotron-3-diarization
./run.sh
# → http://127.0.0.1:7888   Showcase
# → http://127.0.0.1:7888/lab
```

No CUDA. You get a 9-second mix with **three speakers and three overlaps**.

| Page | What it is |
|------|------------|
| [`/`](http://127.0.0.1:7888) | **Showcase** — header, stats, pipeline, DER / RTFx charts, overlapping demo |
| [`/lab`](http://127.0.0.1:7888/lab) | **Live lab** — speaker lanes, hatched overlap, blended vs labelled transcript |

## Run the model for real (Colab T4)

This Mac cannot `restore_from` the checkpoint. Colab can.

1. Put `Nemotron-3-Diarization-preview.nemo` on Google Drive (from NGC `diarization-ea` or the gated HF repo).
2. Open Colab at [colab.research.google.com](https://colab.research.google.com/).
   **Do not** use `colab.research.google.com/github/…` while this repo is private — Colab fetches GitHub as a guest and 404s.
3. **File → Upload notebook** and choose [`notebooks/nemotron_3_diarization_colab.ipynb`](notebooks/nemotron_3_diarization_colab.ipynb) (or download it from the local lab at `/colab`).
4. Runtime → **T4 GPU**. Confirm with `nvidia-smi`. Run all. The last cells launch **Gradio**.

From inside Colab you can also **File → Open notebook → GitHub**, connect the `cobusgreyling` account, tick **Include private repos**, and open this repo.

```python
from nemo.collections.asr.models import SortformerEncLabelModel
model = SortformerEncLabelModel.restore_from("Nemotron-3-Diarization-preview.nemo")
model.cuda().eval()
segments = model.diarize(audio="meeting.wav", batch_size=1)
```

The model is a **diarizer** (~100M params, ≥ 4 GB VRAM). Pair it with any ASR for words.

## Layout

```
notebooks/nemotron_3_diarization_colab.ipynb   # GPU + Gradio
static/index.html                             # showcase
static/lab.html                               # overlapping-voice UI
assets/header.jpg                             # banner
assets/showcase-lanes.jpg                     # lane dashboard still
assets/*.svg                                  # pipeline, DER, RTFx
data/demo-mix.wav + demo-session.json
```

## Licence

Lab code: Apache-2.0. The NVIDIA checkpoint is Early Access (evaluation licence, NVIDIA GPU only) until the public OpenMDW 1.1 drop.
