Specs only get you so far. Most failed Seedance 2.0 takes come from weak briefs, not from "the model is broken." This article is a working playbook for text, image, audio, and video inputs, with an iteration loop you can repeat on any host that exposes the 2.0 family.

## Start with a shot list, not a vibe sentence

A one-line mood prompt ("cinematic rainy street, emotional") forces the model to invent structure. Better: write the clip as 3-6 beats.

Example skeleton:

1. Opening insert (object or environment, 1-2s)
2. Character entrance with clear action
3. Interaction or product moment
4. Reaction / payoff
5. Optional brand or text-safe end frame

Seedance 2.0 handles multi-shot sequences more cleanly when the prompt names camera moves and timing. Borrow film language: low angle, push-in, whip pan, insert, two-shot. You do not need perfect jargon; you need ordered events.

## Multimodal stack that actually helps

### Images

Use images when identity or layout must stay stable:

- Character sheet or clean portrait
- Location plate
- Storyboard frames
- Product packshot with readable silhouette

Avoid busy collages. One job per image. If the host supports labeled references (@Image 1), use the labels in the prompt.

### Video references

Short motion references beat long ones. Feed a clip when you need:

- Camera path
- Body rhythm (dance, sport)
- Edit pace

Keep combined video reference length inside the host limit (often around 15 seconds total across clips).

### Audio references

Audio is easy to underuse. A 3-8 second sample can lock:

- Voice timbre
- Music genre and tempo
- Foley texture (rain, crowd, machinery)

Say what to keep and what to ignore ("match the percussion tempo, invent new melody").

## Three production recipes

### 1) Product ad (I2V + text)

Inputs: hero product still, optional lifestyle plate, 40-80 word script with camera notes.
Goal: readable product, one clear action, audio that sells the moment.
Tip: put the product in the first and last second of the brief so framing does not drift.

### 2) Character short (multi-image + text)

Inputs: 2-3 consistent character stills, wardrobe note, location image.
Goal: same face and outfit across shots.
Tip: if identity drifts, reduce simultaneous characters before you write a longer prompt.

### 3) Music-led social cut (audio + text or R2V)

Inputs: music bed or SFX bed, beat markers in text ("hit on the snare at the spin").
Goal: motion accents land on audio accents.
Tip: generate two durations (for example 5s and 10s) and pick the one that breathes.

## Controllability: extend and edit instead of restarting

When 80% of a take works, do not burn credits regenerating from zero. Use extension to continue the ride, or edit prompts to change one beat (swap the ending action, keep wardrobe). Official materials push these flows as core 2.0 strengths.

A stable loop:

1. Draft on Fast or Mini for structure
2. Lock prompt + references
3. Final pass on standard Seedance 2.0
4. Extend only the keeper take
5. Finish text, color, and loudness in an NLE

## Prompt hygiene that reduces retries

- Name the subject once, then reuse the same label ("the courier in orange")
- Prefer concrete verbs over adjectives
- Cap the number of simultaneous camera tricks
- State what should stay silent if you want ASMR or dialogue-only beds
- Keep on-screen text out of the model when possible; composite later

## Rights and safety

Reference uploads can include faces, logos, and music. Technical success is not legal clearance. Prefer licensed stock, synthetic characters, or talent you control. Hosts may require identity checks for real-person likeness.

## FAQ

### How many references should I start with?

Start with one strong image or none. Add references only when a failure mode appears (face drift, wrong location, flat audio). More inputs can help or confuse.

### Why does my multi-shot clip feel random?

Usually missing shot order. Number the beats. Add transitions ("cut to," "camera holds," "match on action").

### Should every project use audio generation?

No. Silent loops and template B-roll may be cheaper without it. Use native audio when lip energy, foley, or music timing is part of the deliverable.

### Can Seedance 2.0 replace an editor?

No. It replaces empty timeline syndrome. You still choose takes, fix pacing, and ship platform-safe exports.

### What is the fastest way to learn the model?

Pick one recipe (product ad or character short). Generate 10 variations with the same references and only change one prompt variable at a time.

## Closing

Treat Seedance 2.0 like a junior director with perfect stamina and imperfect taste. Give it ordered shots, clean references, and a small number of hard constraints. Save hero fidelity for the final pass. The workflow, not the slogan, is what makes the model look expensive on a real timeline.

## Related reading

- [Seedance 2.0 features: what ByteDance's video model actually does](/blog/seedance-2-0-features-overview) — inputs, duration, resolution, and honest limits.
- [Seedance 2.0 Fast vs Mini: which model for drafts, volume, and finals?](/blog/seedance-2-0-fast-vs-mini) — when to draft cheap and when to spend on finals.

## Try it on Seedance 2.5

Put the playbook into practice in the [AI video generator](/video-generator): ordered shots, references, and short iterations without leaving the product.
