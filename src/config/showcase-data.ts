const SHOWCASE_IMAGE_CDN_BASE =
  'https://pub-06bb62f2aed546cface4bcc4a5aa7f2f.r2.dev/uploads/imgs/showcase';

const showcaseImage = (file: string) => `${SHOWCASE_IMAGE_CDN_BASE}/${file}`;

export interface ShowcasePrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  useCase: string;
  style: string;
  subject: string;
  image: string;
}

export const showcasePrompts: ShowcasePrompt[] = [
  {
    id: 'gpt-image-2-prompt-01',
    title:
      'image_generation_prompt , style : photorealistic cinematic street pho...',
    description:
      'type : image_generation_prompt , style : photorealistic cinematic street photography, documentary aesthetic , resolution : ultra-high resolution , identity_preservation : use_re...',
    prompt:
      '{\n"type": "image_generation_prompt",\n"style": "photorealistic cinematic street photography, documentary aesthetic",\n"resolution": "ultra-high resolution",\n"identity_preservation": {\n"use_reference_image": true,\n"alter_face": false,\n"strict_identity_lock": true,\n"notes": "Use the uploaded reference image as the compositional base. Replace the central character with the woman from the reference image, preserving exact facial structure, skin texture, lighting direction, shadows, depth of field, angle, and emotional expression. No distortions, no artifacts, no skin tone mismatch."\n},\n"subject": {\n"gender": "female",\n"appearance": {\n"hair": "bald (as in the original composition)",\n"age": "adult",\n"expression": "calm, introspective, emotionally neutral",\n"skin": "realistic texture with natural pores and tones"\n},\n"pose": {\n"position": "standing still in the center of a busy urban crosswalk",\n"action": "gently smelling a flower held near the face",\n"posture": "upright, relaxed, perfectly static"\n},\n"wardrobe": {\n"outerwear": "dark minimalist blazer",\n"top": "black shirt"\n}\n},\n"environment": {\n"location": "busy urban pedestrian crosswalk",\n"atmosphere": "metropolitan street scene",\n"crowd": {\n"behavior": "people moving rapidly around the subject",\n"effect": "motion blur from long exposure"\n}\n},\n"lighting": {\n"type": "natural daylight",\n"conditions": "overcast sky",\n"quality": "soft, diffused light",\n"effects": [\n"realistic skin tones",\n"no artificial highlights",\n"natural shadows"\n]\n},\n"cinematic_effects": {\n"long_exposure": true,\n"subject_clarity": "central subject perfectly sharp",\n"surroundings": "crowd blurred with motion",\n"mood": "isolation and stillness amid chaos"\n},\n"color_grading": {\n"palette": [\n"cool grays",\n"muted browns",\n"soft blacks"\n],\n"saturation": "desaturated",\n"style": "professional cinematic grading"\n},\n"camera": {\n"lens_look": "85mm",\n"depth_of_field": "shallow",\n"grain": "realistic film grain",\n"perspective": "identical to original reference image"\n},\n"quality_constraints": [\n"no facial deformation",\n"no AI artifacts",\n"no artificial lighting effects",\n"perfect facial integration",\n"consistent shadows and perspective"\n],\n"output_goal": "Create a photorealistic, cinematic street photograph featuring a woman standing still in a busy crosswalk, smelling a flower, with long-exposure motion blur around her, preserving the exact realism, lighting, depth, and emotional tone of the original reference image."\n}',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-01.webp'),
  },
  {
    id: 'gpt-image-2-prompt-02',
    title:
      'Subject: Tanabata Person and Expression: 20s woman. Soft oval face, t...',
    description:
      'Subject: Tanabata Person and Expression: 20s woman. Soft oval face, translucent natural skin, modest Japanese-style makeup. Dark brown hair in a low, loose bun with loose strand...',
    prompt:
      'Subject:\n{argument name="subject" default="Tanabata"}\n\nPerson and Expression:\n{argument name="age" default="20s"} woman. Soft oval face, translucent natural skin, modest Japanese-style makeup. Dark brown hair in a low, loose bun with loose strands glowing in the morning light. A small purple hair ornament behind the ear. Face tilted slightly upwards, eyes directed towards the paper strips in the upper right, with a peaceful expression as if quietly making a wish.\n\nClothing and Pose:\n{argument name="outfit" default="A white yukata with blue floral patterns"}, dark blue obi sash. Yukata sleeves draped naturally, with careful expression of fabric transparency and wrinkles. Body leaning slightly towards the upper right. Her right arm raised high, gently touching a pink paper strip in the upper right. Her left arm lowered naturally, showing the overlap of the obi and yukata. Fingertips moving delicately, just before pinching the paper strip.\n\nBackground and Light:\nA corner of a Japanese shrine path or shopping street lined with Tanabata decorations in the morning. Bamboo leaves and colorful paper strips (pink, yellow, light blue, lavender) overlap overhead, swaying in the morning breeze. Faint outlines of lanterns and stalls in the background, but clearly a bright morning. Main light source is the low morning sun from the upper left. Strong white highlights on the edges of the hair, cheeks, shoulders, and raised arm. Background is bright with light green and white bokeh. Shadows of paper strips and bamboo fall lightly on the yukata and skin.\n\nComposition and Camera:\nVertical composition. Upper body portrait, centered slightly to the right at the bottom, with large paper strips and bamboo decorations at the top. Camera slightly lower than chest height, a light low-angle shot looking up at the subject. 35mm equivalent natural focal length. Focus on the face and right fingertips, with shallow depth of field softly blurring the background lanterns and path.\n\nTexture and Style:\nPhotorealistic style. A bright, high-key portrait utilizing morning backlighting. Skin is not overly polished, retaining natural pores, fine hair strands, cotton yukata texture, and thinness of the paper strips. Light color palette focused on translucent whites, pale greens, and yukata blues. A small amount of film grain and natural lens flare included.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-02.webp'),
  },
  {
    id: 'gpt-image-2-prompt-03',
    title:
      'a photorealistic vertical lifestyle fashion portrait of a young East...',
    description:
      'Create a photorealistic vertical lifestyle fashion portrait of a young East Asian woman with a short wavy black bob, soft bangs, fair skin, slim proportions, and a calm confiden...',
    prompt:
      'Create a photorealistic vertical lifestyle fashion portrait of a {argument name="character description" default="young East Asian woman with a short wavy black bob, soft bangs, fair skin, slim proportions, and a calm confident expression"} standing on a sunlit Parisian cobblestone street at golden hour beside a vintage dark green city bicycle. She wears effortless minimalist fashion: an olive-green baseball cap, fitted white ribbed sleeveless tank top, short olive pleated skirt, white low-top sneakers, delicate necklace, and a small black quilted chain-strap handbag worn crossbody. Add a second matching black quilted chain handbag hanging from the bicycle handlebar. Pose her upright and relaxed, one hand resting on the bicycle saddle and the other on the handlebar, looking directly at the camera with quiet confidence. The bicycle is a classic step-through frame with cream tires, chrome handlebars, visible spokes, headlamp, rear rack, chain guard, and worn vintage details. Background: elegant old European stone buildings with wrought-iron balconies, a dark green café awning with partially visible white lettering reading {argument name="cafe awning text" default="CAFÉ DE OUCOU"}, warm café seating and a chalkboard sign softly blurred in the background. Lighting: warm golden-hour backlight from the left, soft highlights on skin and hair, gentle lens glow, natural shadows on cobblestones. Style: high-end editorial street fashion photography, timeless Parisian elegance, shallow depth of field, realistic skin texture, 85mm lens look, vertical full-body composition, muted beige and olive color palette, no extra people in focus, no watermark, no added captions.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-03.webp'),
  },
  {
    id: 'gpt-image-2-prompt-04',
    title:
      'Afternoon in the Sun Subject: A vertical portrait centered on a 20-so...',
    description:
      'Theme: Afternoon in the Sun Subject: A vertical portrait centered on a 20-something woman leaning against a long-pile beige sofa in an elegant room with soft sunlight. She is li...',
    prompt:
      'Theme: Afternoon in the Sun\n\nSubject: A vertical portrait centered on a {argument name="age" default="20-something"} woman leaning against a long-pile beige sofa in an elegant room with soft sunlight. She is lightly holding a small red fruit in one hand, and a small plate with several red fruits is placed at her feet.\n\nCharacter/Expression: The woman has a calm, mature impression. She has dark brown loose wavy hair that falls below her shoulders, with thin bangs covering her forehead. Her face is turned slightly toward the camera, and her gaze looks directly at the lens. Her eyebrows and eyes are soft, and her mouth is slightly open, creating a quiet and intimate atmosphere. Her skin is smooth but not excessively polished, leaving a natural flush on her cheeks and lips.\n\nClothing/Pose: Wearing a light champagne-beige satin slip dress. The bust features a shallow V-line with lace decoration, showing a delicate luster and the drape of the fabric. It is paired with white lace-trimmed knee-high socks. Her body leans against the sofa, with her right hand on the seat behind her to support her upper body, and her left hand near her face holding a small red fruit. Her legs are stretched forward, with one knee raised to create depth. Her hair flows naturally over her shoulders and chest, and the hem of the dress gathers softly on her thighs.\n\nBackground/Light: The room has {argument name="background color" default="cream to ivory"} walls, an elegant space with delicate decorative moldings. Warm afternoon natural light streams in diagonally from a window at the top left of the screen, creating bright highlights on the top of her hair, forehead, cheeks, chest, thighs, and the texture of the sofa. The light is a slightly soft direct light, with shadows falling toward the bottom right. The background is softly blurred into a bright melt, with the red fruits serving as a small accent color amidst the beige and ivory.\n\nComposition/Camera: Vertical composition. A close-up portrait looking down slightly from above, with the subject positioned slightly to the right of the center. The face is in the upper middle, and the legs enter the foreground largely to emphasize perspective. It captures the upper body to near the feet, showing the wide, enveloping texture of the sofa. The small plate at her feet is small at the bottom of the frame. Focus is on the face and hands, with a shallow depth of field softly blurring the background and periphery.\n\nTexture/Style: Realistic photographic expression. Warm natural light, low contrast, soft backlighting, and delicate film grain. It carefully depicts the smooth reflection of satin, the fine weave of lace, the fluffy fur of the sofa, and the natural texture of the skin. The overall color scheme is calm and elegant, based on beige, cream, and honey tones. Finished as an indoor portrait that conveys silence and warmth.\n\nNegative: Unnatural face, unnatural gaze, extra fingers, missing fingers, fused limbs, broken joints, twisted clothing, poor contact with props, floating, unnatural gravity, shadows inconsistent with light source, excessive skin correction, overly young face, background information overload, garbled text, logo, watermark; do not replicate the person, clothing, background, fruit placement, exact pose, or exact composition from the reference image.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-04.webp'),
  },
  {
    id: 'gpt-image-2-prompt-05',
    title:
      'An anime-style illustration of a high-impact martial arts battle betw...',
    description:
      'An anime-style illustration of a high-impact martial arts battle between two young female fighters in a traditional wooden martial arts dojo. In the foreground, a girl with blac...',
    prompt:
      'An anime-style illustration of a {argument name="action type" default="high-impact martial arts battle"} between two young female fighters in a {argument name="setting" default="traditional wooden martial arts dojo"}. In the foreground, a girl with black hair in a high bun wears a {argument name="character 1 color theme" default="red and white"} Chinese-style martial arts outfit with baggy pants. She is in a dynamic, low, forward-thrusting stance, surrounded by swirling red energy and water splashes. In the background to the right, a girl with light purple hair in twin buns wears a {argument name="character 2 color theme" default="green and purple"} Chinese dress with gold embroidery and black tights. She is leaping through the air in a flying kick pose, surrounded by swirling blue energy. The wooden floorboards are splintering from the intense impact, with debris and dust flying through the air. Above them hangs a weathered wooden sign with the text "{argument name="sign text" default="武術会"}". The scene features dramatic lighting, a low-angle dynamic perspective, and intense action effects.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-05.webp'),
  },
  {
    id: 'gpt-image-2-prompt-06',
    title: 'BIWA Anime Character Sheet',
    description:
      'Goal: Create a polished anime fashion character reference sheet for BIWA, a quiet wanderer with an obsidian-braid visual signature, calm and distant mood, and a minimal yet high...',
    prompt:
      'Goal: Create a polished anime fashion character reference sheet for {argument name="character name" default="BIWA"}, a quiet wanderer with an obsidian-braid visual signature, calm and distant mood, and a minimal yet high-impact silhouette.\n\nCanvas: Wide horizontal 16:9 character sheet on a warm off-white paper background, elegant editorial layout, lots of negative space, thin gray divider lines, handwritten annotation labels mixed with refined serif typography.\n\nMain subject: Center-left full-body hero render of a slender young woman in a dark avant-garde outfit. She has {argument name="hair color" default="jet black"} very long hair with blunt bangs covering her eyes, one thick braid falling down the front, pale skin, tiny red eyes barely visible beneath the fringe, and delicate dangling earrings. Her expression is detached and unreadable. Outfit: black cropped halter top, extremely wide black high-waisted hakama-like trousers with layered belts and straps, long black fabric panels, dark shoes mostly hidden, and an oversized off-white coat shrugged off the shoulders with voluminous sculptural sleeves. Use soft cinematic lighting, clean shadows, painterly semi-real anime rendering, fashion concept-art finish.\n\nTop-left identity text: Large serif title “{argument name="character name" default="BIWA"}”. Under it include three small profile lines: “ROLE  Wanderer”; “CORE MOOD  Calm · Distant · Unshakable”; “VISUAL SIGNATURE  Obsidian braid, veiled gaze, minimal presence — maximum impact.”\n\nLeft studies: Include exactly 3 black silhouette studies labeled “silhouette study”, showing front, three-quarter/front, and side/back variations of the same long skirt-like outfit and bulky sleeves. Below that include exactly 4 bust expression studies labeled “expression study”: Neutral, Watchful, Cold, Soft. Each bust has nearly identical covered eyes and subtle mouth changes, with the front braid visible.\n\nRight pose sheet: Include exactly 8 smaller full-body or pose views arranged around the main figure. Label them: 1 neutral front standing, 2 back view showing the long braid down the spine and oversized coat, 3 profile view, 4 seated on the floor with fabric pooled around her, 5 leaning forward/downcast, 6 crouching low with hands near the ground, 7 top view looking down at her hair and shoulders, 8 low angle standing with coat and wide trousers emphasized.\n\nBottom detail strip: Include exactly 5 close-up detail panels labeled: veiled gaze, obsidian braid, coat fabric, belt & layers, earrings. The panels should show cropped close-ups of the eyes under bangs, the black braid texture, crumpled off-white sleeve folds, layered black belts/waist construction, and delicate dangling earrings.\n\nVisual style: High-end character design board, Japanese/anime-inspired fashion concept art, muted monochrome palette of black, charcoal, ivory, pale skin, and tiny red accents; precise but soft painterly rendering; elegant handwritten labels; no clutter, no watermark.\n\nConstraints: Keep all text legible and placed like a professional downloadable character sheet. Use exactly 1 main hero render, 3 silhouette studies, 4 expression busts, 8 pose views, and 5 detail close-ups. Maintain the character’s long black braid, veiled eyes, oversized off-white coat, black cropped top, and wide black trousers in every view.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-06.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-07',
    title: 'Five-Slice Emotional Fashion Portrait',
    description:
      'Create a high-end fashion editorial poster: a centered close-up portrait of a young East Asian woman with a short shaggy black bob haircut and wispy bangs divided into exactly f...',
    prompt:
      'Create a high-end fashion editorial poster: a centered close-up portrait of {argument name="character description" default="a young East Asian woman with a short shaggy black bob haircut and wispy bangs"} divided into exactly five perfectly aligned vertical slices. Each slice shows the same face and body position seamlessly continuing across the portrait, but with a different expression and colored lighting personality: 1) far-left slice, red lighting, serious intense expression with slightly parted lips; 2) second slice, deep blue lighting, calm distant expression looking slightly sideways; 3) center slice, emerald green lighting, gentle confident smile; 4) fourth slice, warm golden-orange lighting, joyful wide laugh with eyes nearly closed; 5) far-right slice, violet-purple lighting, soft dreamy neutral expression. Separate the five slices with exactly four thin vertical glowing white divider lines, crisp and luminous from top to bottom. The subject wears a simple dark knit sweater, visible shoulders and neckline, no jewelry, no text. Use dramatic cinematic studio lighting, glossy fashion-magazine retouching, realistic skin texture, sharp eyes, soft volumetric glow, rich saturated color gradients, black background fading into the slice colors, symmetrical composition, square 1:1 canvas, ultra-detailed photorealistic style, high contrast, elegant premium poster look. Avoid extra faces, extra divider lines, captions, logos, borders, or distorted anatomy.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-07.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-08',
    title:
      'Create a vertical Japanese manga page for Tanabata, romantic comedy t...',
    description:
      'Goal: Create a vertical Japanese manga page for Tanabata, romantic comedy tone, showing a misunderstanding about wish strips on a bamboo tree between two stylish anime character...',
    prompt:
      'Goal: Create a vertical Japanese manga page for Tanabata, romantic comedy tone, showing a misunderstanding about wish strips on a bamboo tree between two stylish anime characters.\n\nCanvas: Tall vertical comic page, approximately 2:3 aspect ratio, with clean white panel gutters and dynamic diagonal manga panel borders. Nighttime interior/exterior balcony setting with a deep blue starry sky and Milky Way visible through large windows. Highly polished modern anime illustration, detailed lighting, glossy shadows, cinematic blue moonlight mixed with warm indoor lamp light.\n\nCharacters: Use two recurring characters consistently across all panels. The male lead is {argument name="male character description" default="a slim young man with messy short blue hair, pale skin, multiple earrings, a black glossy hooded jacket over dark streetwear, slightly cool but flustered expression"}. The female lead is {argument name="female character description" default="a petite young woman with long ash-blonde twin-tail hair, red eyes, black gothic lolita dress with lace, black headband, ribbon accessories, pink heart earrings, playful mischievous smile"}.\n\nLayout: Exactly 6 panels. Panel 1 is a wide top panel spanning the full page width. Panels 2 and 3 sit beneath it side by side, with panel 2 narrow on the left and panel 3 larger on the right. Panels 4 and 5 sit below, with panel 4 on the left showing the boy alone and panel 5 larger on the right showing both characters arguing near the bamboo. Panel 6 is a wide full-width chibi gag panel at the bottom with a pastel background.\n\nPanel details:\n1. Wide top panel: The blue-haired boy stands by a bamboo branch covered with colorful Tanabata tanzaku wish papers, carefully tying or checking a light-blue strip. Starry night sky fills the left background, bamboo leaves and hanging wish strips fill the right. Include about 7 visible hanging wish strips in blue, yellow, pink, purple, and tan.\n2. Middle-left panel: The gothic girl peeks through ornate double doors from a warmly lit room, surprised and curious. Add one vertical speech bubble saying {argument name="girl surprised line" default="あれ？"}.\n3. Middle-right panel: Close-up of the girl beside bamboo leaves and tanzaku, smiling teasingly with red eyes bright, one hand near her ear. Add one vertical speech bubble saying {argument name="girl teasing line" default="うちにもユタの笹ってあったんだ？"}. Show about 5 colorful wish strips hanging around her.\n4. Lower-left panel: The boy turns back in embarrassment, holding a tan wish strip partly hidden behind him, sweat drop and startled manga mark above his head. No large dialogue needed.\n5. Lower-right panel: The boy and girl face each other indoors near the balcony and bamboo. The boy looks defensive with one hand on his hip, the girl smiles with eyes closed, teasing him. Add two speech bubbles: boy says {argument name="boy excuse line" default="物置にあったんだよ！掃除してただけだし！"}; girl says "そかそか".\n6. Bottom full-width chibi panel: Simplified cute chibi versions on a pale lavender dotted background. The boy is flustered, blushing and puffing, holding several rectangular tanzaku papers that fly from his hands; the girl giggles with eyes closed and hand near mouth. Add small cartoon steam puffs, sparkle stars, and motion marks. Exactly 5 loose tanzaku papers should be visible in this gag panel.\n\nText and lettering: Use Japanese manga-style vertical speech bubbles with clean black text on white bubbles. Keep the visible dialogue exactly as specified. Do not add extra narration boxes or sound effects beyond small decorative emotion marks.\n\nVisual style: Premium glossy anime manga rendering, detailed hair strands, delicate faces, high contrast moonlit atmosphere, elegant gothic fashion, romantic Tanabata decorations, expressive comedy beats, crisp white gutters, no watermark, no logo.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-08.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-09',
    title: 'Retro Y2K Computer Workspace Portrait',
    description:
      'A photorealistic lifestyle portrait of a young East Asian woman seated casually at a retro computer workstation in a cozy apartment bedroom. She is turned slightly away from the...',
    prompt:
      'A photorealistic lifestyle portrait of a {argument name="subject" default="young East Asian woman"} seated casually at a {argument name="workspace" default="retro computer workstation"} in a {argument name="room" default="cozy apartment bedroom"}. She is turned slightly away from the desk, glancing back toward the camera with a thoughtful, serene expression that feels spontaneous and unposed. Her long dark hair falls naturally around her face with a few loose strands, and she wears a relaxed cream-colored oversized knit sweater paired with comfortable white lounge shorts, creating a warm, understated look. The scene is set in a softly cluttered late-night workspace inspired by early internet-era bedrooms. A chunky CRT monitor casts a subtle glow across the desk, displaying a coding interface, surrounded by a classic beige keyboard, wired mouse, scattered notebooks, a steaming mug, and small personal trinkets. The room extends into the background with a partially open door, a wooden chest of drawers, a casually rumpled bed, stacked books, and a simple analog wall clock, adding character and authenticity. Shot as if captured with a compact point-and-shoot camera using direct flash, the lighting feels intimate and nostalgic, with gentle highlights, realistic skin texture, and soft shadow falloff. Muted vintage tones, subtle color fading, delicate film grain, and tiny imperfections create the feeling of a discovered photograph from the early 2000s. Shallow depth of field keeps focus on the subject while the room softly melts into the background. Vertical composition, cinematic framing, natural storytelling, cozy midnight programming mood, authentic Y2K-inspired atmosphere. Style Keywords: photorealistic lifestyle portrait, candid indoor photography, nostalgic computer room, retro internet aesthetic, early-2000s bedroom, point-and-shoot flash, cinematic realism, natural beauty, editorial photography, warm ambient mood, soft film grain, vintage color palette, intimate storytelling, high detail, authentic 35mm film look.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-09.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-10',
    title: "Worm's-Eye View Editorial Fashion Portrait",
    description:
      "Ultra-realistic editorial fashion portrait captured from an ultra-low-angle worm's-eye view, with the camera placed on the ground and pointing straight upward toward the subject...",
    prompt:
      'Ultra-realistic editorial fashion portrait captured from an ultra-low-angle worm\'s-eye view, with the camera placed on the ground and pointing straight upward toward the subject. A stylish young woman leans over the camera with both hands reaching toward the lens, her oversized hands creating dramatic forced perspective. She has a soft smile, a relaxed expression, and short, messy wavy bob hair naturally blowing in the wind. She wears minimal makeup, delicate gold jewelry, an {argument name="sweater style" default="oversized chunky cream cable-knit sweater"} with voluminous sleeves, and {argument name="trousers" default="high-waisted mustard corduroy trousers"}.\n\nThe background features a {argument name="sky" default="bright, clear blue sky"} with the sun positioned directly behind her head, creating strong golden backlighting, a cinematic rim light around her hair, natural lens flare rings, rainbow optical flare, a glowing sun halo, subtle atmospheric haze, and a dreamy ambiance.\n\nShot with a 24mm ultra-wide lens at f/2.0, featuring shallow depth of field with the hands slightly out of focus while the face remains tack-sharp. Cinematic composition, Kodak Portra 400 color grading, warm golden-hour tones, natural skin texture, editorial magazine photography, high dynamic range, premium fashion campaign aesthetic, ultra-detailed, photorealistic, 8K.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-10.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-11',
    title: 'Pink Kawaii Girl Room',
    description:
      'Subject: A beautiful young Japanese woman in her early 20s with long platinum blonde hair and a healthy, curvy hourglass figure. She is confident, playful, and charming, with a...',
    prompt:
      "Subject: A beautiful young Japanese woman in her early 20s with long platinum blonde hair and a healthy, curvy hourglass figure. She is confident, playful, and charming, with a captivating smile, looking back and down at the camera. Clothing: A white leather strapless mini dress with a white lace inner layer that naturally sways with her movement. Pose: Walking forward while looking back, peering down at the camera from above. She holds a cute animal plushie (pink or white bear/rabbit) in one hand behind her, lightly covering the back of the dress hem. Her long bare legs form a strong diagonal across the frame, giving a sense of dominance, vitality, and movement. Scene: A Kawaii-style pink room with macaron pink walls and bedding. The room is filled with original cute plush toys, fairy lights, original illustration posters, and a soft fluffy rug, creating a warm and dreamy atmosphere. Composition: Extreme low-angle bug's-eye view shot from floor height using a 20mm ultra-wide-angle lens to create perspective exaggeration, making the subject look large and impactful. Atmosphere: Confident, playful, cute, and fashionable. An indoor portrait with dynamic expression, blending a dreamy girl's room vibe with fashion photography's visual impact. Lighting: Warm indoor lights combined with natural light from the window. Fairy lights emit a soft glow, with skin showing delicate highlights. Photography Style: Hyper-realistic, indoor fashion portrait, cinematic lighting, high-end commercial photography, dynamic snapshot, dreamy soft texture. Quality: Ultra-high detail, HDR, Masterpiece, Best Quality, Sharp Focus, 8K, High Resolution. Aspect Ratio: 16:9. Restrictions: Use original designs only; no copyrighted characters or existing anime art styles.",
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-11.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-12',
    title: 'High-End Layered Editorial Action Poster',
    description:
      'Create a 16:9 full-bleed editorial action poster for Brand Name. The brand’s visual identity follows these must-visible traits: a bright outdoor photograph with a clear open sky...',
    prompt:
      'Create a {argument name="aspect ratio" default="16:9"} full-bleed editorial action poster for {argument name="brand name" default="Brand Name"}. The brand’s visual identity follows these must-visible traits: a bright outdoor photograph with a clear open sky dominating a large portion of the frame; enormous warm-cream extra-condensed block letters cropped by the canvas and sitting behind the main subject; one oversized action figure cutting diagonally across the layout and breaking through the text layer; a low or close wide-angle camera angle that makes the foreground feel physically imposing; secondary text, large numerals, or stacked words in cream placed along bottom and side edges; compact white editorial microcopy in short tight clusters anchored to strong grid positions; one vivid accent color concentrated on the hero product or outfit while the environment stays sky-blue and neutral; hard midday sunlight with crisp shadows and high-contrast edges; a layered structure alternating between flat graphic type and real photography; minimal ornament — only small marks, rules, or separators; a dense, kinetic layout with the action dominant, type second, and microcopy third.\n\nScene: {argument name="subject" default="an athlete"} is {SUBJECT_ACTION} with {PRODUCT_OR_PROP} in {LOCATION}, surrounded by {BACKGROUND_ELEMENTS}.\n\nCamera & Composition: Low or close wide-angle outdoors, oversized foreground scale, decisive frozen motion, one strong diagonal, subject cropped by at least one canvas edge.\n\nTypography: Place massive warm-cream ultra-condensed block sans lettering reading {MAIN_TEXT} behind the subject, filling over half the canvas, cropped by the frame and partially hidden by the action. Add compact white microcopy reading {SECONDARY_TEXT} in tight editorial blocks. Include a small generic {ACCENT_SYMBOL} mark and bottom information clusters in cream.\n\nWardrobe: {WARDROBE_STYLE}. Brand colors: saturated sky-blue or cyan dominant, warm cream type, crisp white microcopy, deep shadows, one vivid accent on the hero prop or wardrobe.\n\nLighting & Finish: Hard midday sun, crisp shadows, high-contrast commercial photo realism, slight print-grain texture. No illustration, 3D rendering, real logos, or watermarks.\n\nAvoid: {SOURCE_CONTENT_TO_AVOID}. Also exclude: real brand logos, watermarks, QR codes, comic or halftone effects, 3D renders, dark studio scenes, muted palettes, or a tiny distant subject.\n\nGenerate as a 4K ultra-high-resolution raster image.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-12.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-13',
    title: 'Selective Color Street Photography',
    description:
      'A cinematic street portrait of a young woman walking through a crowded city, with the subject perfectly sharp while the surrounding pedestrians are blurred using a dramatic pann...',
    prompt:
      'A cinematic street portrait of a young woman walking through a crowded city, with the subject perfectly sharp while the surrounding pedestrians are blurred using a dramatic panning motion effect. The entire image is monochrome black and white except for the woman\'s {argument name="coat color" default="deep navy-blue"} wool coat, which remains the only vivid color in the scene. She glances back over her shoulder with a calm, thoughtful expression, loose wind-swept hair, soft natural makeup, and a minimalist shoulder bag. The busy urban background is filled with fast-moving commuters rendered as ghostly motion blur, emphasizing loneliness amidst the crowd. Soft overcast daylight, shallow depth of field, subtle film grain, realistic skin texture, cinematic contrast, emotional storytelling, editorial fashion photography, premium fine-art street photography, ultra-photorealistic, Leica M11 look, Kodak Tri-X black and white film aesthetic with selective color, 50mm lens, f/1.8, ISO 100, 1/20s shutter speed, natural ambient lighting, high dynamic range, ultra-detailed, award-winning composition, 8K.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-13.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-14',
    title: 'Korean 2000s Phone Photo Strip',
    description:
      'layout : vertical 3-panel college photo strip , subject : girl with long hair in beige knit vest , panel_top : close-up resting chin on school desk, bored expression , panel_mid...',
    prompt:
      '{"layout":"vertical 3-panel college photo strip","subject":"{argument name="subject" default="girl with long hair in beige knit vest"}","panel_top":"{argument name="top panel scene" default="close-up resting chin on school desk, bored expression"}","panel_middle":"standing against white classroom wall holding book, slight motion blur","panel_bottom":"sitting on wooden floor tying shoelace","aesthetic":"{argument name="style aesthetic" default="Korean 2000s phone camera quality, warm tint, low resolution, handwritten doodle overlay, harsh flash, messy Korean girl style"}"}',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-14.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-15',
    title: 'Japanese Design Magazine Poster',
    description:
      'Create a clean editorial magazine poster for a Japanese design-intelligence service. Canvas: portrait poster on a light gray background, with a white page centered and a subtle...',
    prompt:
      'Create a clean editorial magazine poster for a Japanese design-intelligence service. Canvas: portrait poster on a light gray background, with a white page centered and a subtle drop shadow, about 4:5 ratio. Visual style: minimalist modern Swiss/Japanese editorial layout, lots of white space, sharp black typography, thin divider lines, small uppercase English microcopy, high-end design magazine feel. Main headline: large bold black Japanese type in the upper right, reading {argument name="headline text" default="デザインの Scopeを、もっと広げよう。"}, with “Scope” in Latin letters, arranged across 3 stacked lines and overlapping slightly above the photo area. Subheadline: smaller bold Japanese line below the headline, reading {argument name="subheadline text" default="水面下から、少し先の景色をのぞく。"}. Hero image: large rectangular photo occupying the lower center/right, showing {argument name="main subject" default="a Japanese businessman in a dark navy blazer and glasses standing in profile by a tall window, holding a small notebook or phone, looking out over a rainy modern city street with blurred buildings and traffic"}; cool blue-gray city tones, shallow depth of field, realistic photography. Left margin editorial column: at top left, small uppercase text “CURATED DESIGN INTELLIGENCE”, a thin vertical line beneath, then a small issue row with “01”, a long horizontal rule, and “ISSUE_05”. Along the lower left margin, create exactly 4 stacked navigation items with small labels and descriptions: 1) “PERSPECTIVE” with “Stream / culture, urban, and new synthifications.” and number “01”; 2) “AI & DESIGN” with “Designing conversational architectures and design-agent landscape.” and number “02”; 3) “CULTURE” with “Locomoting nation of Tokyo, extensionism, privileges.” and number “03”; 4) “RESEARCH” with “Research unitile evolution in art and design professions.” Use tiny black type with thin vertical separators between items. Bottom right call-to-action: a pale lime rectangle overlaying the lower-right corner of the photo/page, containing bold uppercase text {argument name="call to action" default="READ / LEARN / THINK / MAKE"} and a faint white downward triangle/arrow icon. Constraints: keep the composition simple and premium, use only black, white, gray, cool photo colors, and pale lime accent; no logos, no extra text, no decorative clutter.|',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-15.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-16',
    title: 'Melancholic Portrait Cinema Style',
    description:
      'A cinematic close-up portrait of a young East Asian woman with long slightly messy black hair falling across her face, porcelain skin, soft pink lips, and deep expressive eyes....',
    prompt:
      'A cinematic close-up portrait of a {argument name="subject" default="young East Asian woman"} with long slightly messy black hair falling across her face, porcelain skin, soft pink lips, and deep expressive eyes. She gazes directly into the camera with a {argument name="expression" default="calm, melancholic"} expression. Dramatic low-key lighting illuminates only parts of her face, creating strong contrast against a dark shadowy background. Subtle strands of hair move gently as if touched by a breeze, adding a natural and emotional feel. Moody atmosphere, minimalist composition, soft skin texture, delicate facial details, editorial beauty photography, subtle grain, muted colors, intimate and mysterious mood, ultra-realistic, high detail, captured like an artistic film still.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-16.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-17',
    title: 'Japanese Morning Portrait Aesthetic',
    description:
      'Subject: Morning Character/Expression: A woman in her 20s. Atmosphere of a natural and mature Japanese photo model. Dark brown hair loosely tied back, with thin bangs and a few...',
    prompt:
      'Subject: Morning\n\nCharacter/Expression:\n{argument name="age" default="A woman in her 20s"}. Atmosphere of a natural and mature Japanese photo model. Dark brown hair loosely tied back, with thin bangs and a few stray hairs around the face. Clear Japanese-style makeup, pale pink-beige lips, natural complexion, and realistic skin texture. The expression is calm, looking at the camera a bit sleepily. Do not make her look childish.\n\nClothing/Pose:\n{argument name="outfit" default="Cream-colored ribbed loungewear"}. Top is a camisole style with thin shoulder straps and built-in cups; bottom is a high-leg triangular cut lounge panty. Made of thick, non-transparent cotton ribbing with a soft texture that looks natural as loungewear. The person sits diagonally on a white bed, leaning their upper body slightly back. Their right hand is placed on the sheet behind them, supporting with fingertips. The left leg is bent and flowing to the left of the screen, and the right leg is extended naturally toward the front of the bed. Shoulders relaxed, spine not too straight, in a quiet, lingering seated posture.\n\nBackground/Lighting:\n{argument name="location" default="Wooden Japanese-style inn bedroom"}. Thin white canopy fabric hangs loosely in the foreground and background, with a shoji window in the back left and a small indirect light and wooden wall in the back right. The white duvet has natural wrinkles and sinkage. Soft morning natural light enters from the shoji on the left, softly illuminating the person\'s face, shoulders, collarbone, and knees. Shadows fall thinly to the back right, with warm reflected light coming from the wooden walls and bed. The background is not too bright, maintaining a quiet indoor feel centered on white and wood tones.\n\nComposition/Camera:\nPortrait 4:5. Mid-range indoor portrait. The person is slightly to the right of the center, in a nearly full-body composition from head to toes. Showing a wide area of the white bed surface, with thin fabric wrapping the person from the left and right. The camera is slightly above bed height, close to eye level. Natural compression around 50mm, focus on the face, background and thin fabric lightly blurred. Diagonal flow created by the person\'s posture, fabric, and bed wrinkles.\n\nTexture/Style:\nHigh-quality Japanese photography. Natural light, soft contrast, warm tones of cream and wood. Avoid excessive skin retouching, carefully preserving fine skin texture, fabric ribbing, sheet wrinkles, and the transparency of the thin fabric. A clean, quiet morning atmosphere, elegant indoor photography with a sense of daily life.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-17.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-18',
    title: 'Luxury Fashion Editorial Portrait',
    description:
      'An ultra-premium luxury fashion editorial portrait of a beautiful young East Asian woman with long, naturally wavy black hair and flawless natural makeup, walking confidently to...',
    prompt:
      'An ultra-premium luxury fashion editorial portrait of a beautiful {argument name="subject" default="young East Asian woman"} with long, naturally wavy black hair and flawless natural makeup, walking confidently toward the camera with a calm, powerful CEO-like presence. She wears an elegant ivory silk satin button-up blouse with soft natural folds, tucked into high-waisted tailored black wide-leg trousers, paired with black pointed-toe leather heels. One hand rests casually inside the trouser pocket while the other hand loosely holds a pair of luxury black sunglasses. She wears minimal refined gold jewelry including a delicate necklace, small earrings, a luxury gold wristwatch, and a subtle bracelet.\nBackground: A seamless premium studio backdrop featuring a {argument name="background color" default="deep emerald green fading into dark forest green"} with a perfectly smooth gradient. Behind the subject is a large soft warm golden circular spotlight creating beautiful depth and luxury separation. The polished studio floor has a very subtle cinematic reflection without appearing glossy.\nPose: Walking naturally toward the camera with crossed strides, shoulders relaxed, spine perfectly straight, chin slightly raised, confident posture, elegant runway-inspired movement, natural arm swing, luxurious body language, eyes looking directly into the lens with a composed editorial expression.\nLighting: Premium Vogue-style three-point studio lighting with a large soft diffused key light, warm golden rim light outlining the hair and shoulders, subtle fill light preserving realistic shadows, cinematic HDR lighting, soft highlight roll-off, realistic reflections on the satin fabric, rich contrast, luxury commercial photography lighting.\nCamera: Full-body portrait, eye-level angle, 85mm full-frame lens, f/2.2 aperture, shallow depth of field, razor-sharp focus on the eyes and face, realistic optical perspective, premium fashion campaign composition.\nColor Grading: Luxury editorial color grading with deep emerald greens, warm golden highlights, rich blacks, natural ivory fabric tones, balanced skin tones, soft bloom, HDR dynamic range, subtle filmic contrast, premium {argument name="brand style" default="Vogue, Zara, Ralph Lauren and COS"} campaign aesthetic.\nQuality: Hyper-realistic, photorealistic, ultra-detailed skin texture, natural hair strands, realistic fabric physics, luxury commercial fashion photography, editorial masterpiece, magazine cover quality, 8K ultra-HD, award-winning fashion campaign, clean composition, no text, no watermark.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-18.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-19',
    title: 'Albedo Cosplay Instagram Story',
    description:
      'Style: An Instagram story-style photo of Albedo cosplay; Content: squatting on the ground facing the camera, making exaggerated rebellious gestures with both hands, rolling eyes...',
    prompt:
      'Style: An Instagram story-style photo of {argument name="character" default="Albedo"} cosplay; Content: {argument name="action" default="squatting on the ground facing the camera, making exaggerated rebellious gestures with both hands, rolling eyes, with an arrogant and disdainful expression"}',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-19.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-20',
    title: 'Fantasy Whimsical Downtown Aerial View',
    description:
      'Create a high-detail 16:9 aerial terrain image of an Alice in Wonderland-inspired fantasy downtown. The city should feel whimsical, cinematic, and architectural: card-suit tower...',
    prompt:
      'Create a high-detail 16:9 aerial terrain image of an {argument name="inspiration" default="Alice in Wonderland"}-inspired fantasy downtown. The city should feel whimsical, cinematic, and architectural: card-suit towers, checkerboard plazas, keyhole',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-20.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-21',
    title: 'Detailed Identity Card Photography',
    description:
      'type : Nahaufnahme-Fotografie , subject : Eine fiktive Ausweiskarte, die von einer Hand gehalten wird , card_content : header_text : MUSTERREPUBLIK / AUSWEISKARTE / SAMPLE ID CA...',
    prompt:
      '{"type": "Nahaufnahme-Fotografie","subject": "{argument name="subject" default="Eine fiktive Ausweiskarte, die von einer Hand gehalten wird"}","card_content": {"header_text": "MUSTERREPUBLIK / AUSWEISKARTE / SAMPLE ID CARD","logo": "Ein blaues Symbolfeld oben links mit dem Länderkürzel \'MR\'","portrait": {"appearance": "Junge Frau mit langen, glatten blonden Haaren und Mittelscheitel","facial_features": "Helle Haut mit deutlich sichtbaren natürlichen Sommersprossen auf Nase und Wangen, neutraler Gesichtsausdruck, haselgrüne Augen mit geradem Blick nach vorn","clothing": "Schwarzes Oberteil mit sichtbarem Ausschnitt","accessories": "Kleine silberne Ohrstecker an den Ohrläppchen"},"text_data": {"surname": "MUSTERNAME","given_name": "{argument name="given name" default="ERIKA"}","birth_date": "{argument name="birth date" default="07.11.1998"}","birth_place": "BERLIN","expiry_date": "01.12.2030"},"surface_texture": "Glänzende laminierte Oberfläche mit sichtbaren holografischen Sicherheitsmustern und Guilloche-Linien über Porträt und Text"},"foreground_hand": {"position": "Hält die untere rechte Ecke der Karte","skin_tone": "Hell","fingernail": "Sichtbarer Daumen mit langem, mandelförmigem Fingernagel, lackiert in glänzendem Bordeauxrot oder Dunkelrot"},"background": "Schlichte, einfarbig weiße Oberfläche","lighting": "Weiches, gleichmäßiges Innenlicht mit leichten Reflexionen auf der Kartenoberfläche und dem glänzenden Nagellack","framing": "Vertikale Nahaufnahme aus der Vogelperspektive, vollständig auf die Karte und den Daumen fokussiert"}',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-21.jpg'),
  },
  {
    id: 'gpt-image-2-prompt-22',
    title: 'Realistic Identity Card Macro Photography',
    description:
      'Ultra-realistic 16:9 close-up flat-lay studio photograph of an Australian citizenship identity card placed on a clean light grey or soft neutral background. The card is horizont...',
    prompt:
      'Ultra-realistic 16:9 close-up flat-lay studio photograph of an {argument name="card type" default="Australian citizenship identity card"} placed on a clean light grey or soft neutral background. The card is horizontally aligned, centered in frame, captured in sharp macro focus with soft diffused studio lighting. The design follows an official government-issued identity card aesthetic with modern typography, structured information layout, and advanced anti-counterfeit security detailing. Large bold header at top reads: “AUSTRALIA” with secondary title “CITIZENSHIP CARD” and subtitle “COMMONWEALTH OF AUSTRALIA.” Top-left corner features the national flag. Upper-right area includes the coat of arms. The card contains a passport-style portrait of a {argument name="subject" default="young Australian woman"}: – Fair/light skin tone with natural texture and subtle freckles – Shoulder-length dark blonde to light brown hair with soft waves – Hazel-green eyes, neutral expression, direct gaze – Minimal makeup, realistic facial details – Wearing a dark blazer or black top with subtle gold jewelry Personal identity information displayed clearly: – Surname: {argument name="surname" default="JOHNSON"} – Given Names: EMILY GRACE – Date of Birth: 24 JAN 1995 – Place of Birth: MELBOURNE, VIC – Citizenship Status: AUSTRALIAN CITIZEN – Citizenship Number: ACN 1234567 – Date of Issue: 15 MAY 2024 – Date of Expiry: 15 MAY 2034 – Sex: F – Height: 165 cm – Document Number: CC1234567 Security and design features include: – Intricate guilloche line patterns across the entire card surface – Fine microprinted anti-counterfeit textures – Holographic security patches with iridescent rainbow reflections – Transparent layered security overlays – Hologram featuring map and Southern Cross stars – Large engraved illustration of the Sydney Opera House and Sydney Harbour Bridge across the right side – Faint map outline embedded into background texture – Signature at bottom: “Emily G. Johnson” – Machine-readable identity strip at lower edge Additional design styling: – Soft blue, gold, and neutral pastel gradients – Polycarbonate laminated card texture with realistic reflections – Clean government visual language Lighting is soft and evenly diffused, emphasizing holographic effects, engraved textures, and realistic print detail without harsh shadows. No hand visible. Style: ultra-detailed, photorealistic, 8K resolution, macro clarity, professional product photography, documentary realism, highly realistic government ID card design.',
    useCase: 'Uncategorized',
    style: 'GPT Image 2',
    subject: 'Prompt',
    image: showcaseImage('gpt-image-2-prompt-22.jpg'),
  },
];

export function getShowcasePromptById(id?: string | null) {
  if (!id) {
    return undefined;
  }

  return showcasePrompts.find((item) => item.id === id);
}
