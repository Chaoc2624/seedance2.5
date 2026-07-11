export type ShowcaseCard = {
  title: string;
  label: string;
  image: string;
  accent?: string;
};

export type VisualCard = {
  title: string;
  description?: string;
  image: string;
  href: string;
  label?: string;
};

export type SeedanceVideoAsset = {
  title: string;
  label: string;
  prompt: string;
  src: string;
  poster: string;
};

export type GalleryItem = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
};

export const CONTENT_FRAME_CLASS = 'mx-auto w-full px-4 sm:px-6 lg:px-8';
export const BRAND_LOGO_SRC = '/logo.svg';
export const SEEDANCE_VIDEO_CDN_BASE =
  'https://pub-06bb62f2aed546cface4bcc4a5aa7f2f.r2.dev/uploads/media/seedance-2';
const SHOWCASE_IMAGE_CDN_BASE =
  'https://pub-06bb62f2aed546cface4bcc4a5aa7f2f.r2.dev/uploads/imgs/showcase';

const showcaseImage = (file: string) => `${SHOWCASE_IMAGE_CDN_BASE}/${file}`;

const seedanceVideoPrompts = [
  "Photorealistic cinematic, one single continuous unbroken shot from start to finish - absolutely no cuts, no edits, no transitions, one fluid uninterrupted camera move, 16:9. Bright daylight in a lush green forest, sunlight filtering through the canopy, leaves and tree trunks softly blurred.\nThe shot begins directly behind a vivid colorful butterfly fluttering fast and dynamically through the forest, the camera chasing close behind its wings as it weaves between trees, shafts of light and foliage - erratic, lively and kinetic.\nWithout any cut, in the same fluid motion, the camera keeps racing with the darting butterfly deeper through the trees. Then, at the midpoint, a parrot suddenly bursts in from the side and snatches the butterfly out of the air, biting down and clamping onto the edge of one of its wings in its beak - and the camera sweeps with the strike in one continuous move.\nStill unbroken, the camera drives in onto the moment of capture and explodes into a dramatic bullet-time effect: time nearly freezes as the parrot's beak bites and clamps onto the butterfly's wing in an extreme macro close-up, the wing bending and creasing in the beak's grip, and the camera sweeps slowly around the frozen instant - shimmering powder and tiny iridescent scales scattering off the pinched wing and hanging suspended motionless in mid-air, the delicate wing membranes and veins razor-sharp, the parrot's beak texture and eye in crisp detail, the butterfly caught mid-flutter - hyper-detailed.\nOne seamless continuous camera move - chase from behind, racing through the forest, into the parrot's strike, ending in a bullet-time orbit around the catch. Flowing and dynamic, collapsing into near-frozen bullet time only at the macro catch. Shallow depth of field, strong motion blur on the chase resolving into crisp frozen detail, bright natural daylight, dappled forest light, high dynamic range, ultra-detailed photorealistic textures - wing scales, powder, feathers, foliage - 4K, high-end wildlife documentary look. Pacing over 10 seconds: about 4-5 seconds of dynamic butterfly flight, the parrot striking around the midpoint, then the rest in bullet-time macro of the parrot biting the wing. 10 seconds, single continuous take.",
  "Extreme macro on a cybernetic implant's micro-circuitry threading into synthetic muscle, fiber-optic veins lighting up gold beneath translucent skin, servos flexing - then the camera snaps back as the augmented escapee rips free of a lab restraint chair and punches through a reinforced glass wall, alarms strobing as security mechs flood the corridor. Two beats of the runner sprinting through the breach, then a sudden zoom in on a palm-mounted blaster charging white-hot and discharging point-blank into a pursuing drone, the blast lighting the whole hallway. Handheld camera judders hard on the glass shatter, shards and sparks spraying the lens under clinical white lab light. Sterile whites and hot gold circuitry. 16:9, 10 seconds.",
  "Sweeping wide shot of a mountain-sized titan of ice and stone tearing itself free from a glacier as an army of armored warriors scrambles across the frozen valley below. Handheld camera shakes hard with each cracking movement, snapping from sheets of ice shattering off the titan's shoulders to soldiers diving from collapsing crevasses to a war-horn blaring across the field. Snow erupts in vast plumes, glowing runes flare along the titan's limbs, the whole glacier splinters apart. Stark whites and frozen blues, crushing primordial scale and chaos. 16:9, 10 seconds.",
  'Style: 8K photorealistic, anamorphic widescreen, neon cyberpunk cinematic grade, fine grain.\nLighting: mixed neon key - green and magenta storefront glow from camera-left, cool hazy daylight down the street axis, hot rim from a pink neon strip at frame-right, armor catching colored reflections.\nColor: teal-and-magenta neon street as the dominant, the white-and-red armor and the red armor as the saturated subjects, green shop signs and amber banners as secondary accents.\nCamera: anamorphic cine optics, horizontal neon flares, real motion blur, weighty operator inertia that turns soaring on the lift.\nSkin: armor at material-level realism - brushed metal, scuffed paint, neon reflections sliding across the plates, fine catch-lights on the visors.\nActing: a charged beat before contact - the offered hand held still, her hesitation, then the snap of the grab and the surge upward, bodies reacting to acceleration.\nPhysics: real mass and inertia - the grab yanks her weight, the lift accelerates against gravity, capes and loose straps trail in the wind, the city falls away below with parallax.\nComposition: two-shot profile on the street, then vertical thrust into the cityscape, depth from foreground neon to mid figures to deep hazed skyline.\nContinuity: same white-and-red armored figure, same red armored figure, same neon cyberpunk city across all cuts.\nTechnical: 24fps, ultra high detail, smooth motion accelerating into the flight.\nAudio: diegetic only - neon hum and distant city noise, a soft servo whir, the snap of the grab, a building thruster roar, wind rushing on the ascent.\n\nSCENE CONTEXT\nOn a neon cyberpunk street, a white-and-red armored figure offers his hand to a red-armored figure; the instant she touches it he grips her, pulls her in, and thrusts upward - they fly through the city skyline locked in an embrace.\n\nACTIVE REFERENCES\n<<<image_1>>>: the two figures and the location - left, a slender figure in glossy red armor with a red visored helmet; right, a taller figure in white-and-red armor with a red-striped visored helmet, hand extended; a neon cyberpunk street with green and amber Chinese-character signs, magenta neon, an elevated rail structure and hazed skyline behind. 100% matches the reference.\n\nLOCATION MAP\nForeground: a dark neon-lit doorway edge framing frame-right, magenta strip-light. Midground: the two figures facing each other on the street. Background: the neon storefronts, elevated rail bridge, and hazed city skyline. Camera starts low on the street, then rises with the figures into open sky. Movement runs from a still face-off into a vertical climb.\n\nFIRST FRAME / BLOCKING\n<<<image_1>>> exactly - red-armored figure at left in profile, white-and-red figure at right with hand extended toward her, neon street behind, both standing still on the wet pavement.\n\nFORMAT MODE\nSequence of 6 cuts, no timecodes. Cuts only at the specified points, the camera does not cut on its own.\n\nOPTICS\nCUT 1 - MS 47° two-shot. CUT 2 - ECU 18° on the hands. CUT 3 - MCU 29° on the grab. CUT 4 - WS 63° low-angle lift. CUT 5 - EWS 84° city flight. CUT 6 - MS 47° embrace in air. No drift mid-segment.\n\nCAMERA\nLocked-off street-level two-shot for the offer, a tight insert on the touching hands, a snap-in as he grabs, then a low-angle craning up that releases into a soaring rise tracking them into the skyline, settling close on the embrace mid-air.\n\nACTION\nCUT 1 - the white-and-red figure holds his open hand out, still; the red figure hesitates, then lifts her hand toward his, neon glinting off both plates.\nCUT 2 - extreme close on the hands as her fingers touch his palm - the instant of contact, neon reflections catching the metal.\nCUT 3 - his hand clamps shut on hers and yanks her in, pulling her against his chest, both helmets close, a soft servo whir.\nCUT 4 - a building thruster roar - they launch straight up off the street at 60 km/h, the camera craning to follow, neon signs streaking downward past them.\nCUT 5 - wide above the city, the two soaring through the hazed neon skyline, rail bridges and towers sliding below, wind tearing past, locked together.\nCUT 6 - close in the air, he holds her wrapped in both arms, both helmets turned toward each other, the city lights rushing soft behind them.\n\nPHYSICS\nThe grab transfers real weight - her body pulls in with inertia. The lift accelerates against gravity, straps and loose fabric trailing downward in the rush. The city falls away with true parallax. Both armored bodies stay rigid with weight, joints articulating as they move.\n\nLIGHTING\nGreen and magenta neon key on the street beat, hot pink rim at frame-right; on the ascent cool hazy daylight takes over with neon glow falling away below; WB shifts from 4000K neon street to 6500K open sky, held within each cut.\n\nAUDIO\nNeon hum and distant city noise on the street, a soft servo whir on the grab, a building thruster roar on launch, wind rushing through the flight, settling to a low hum on the embrace.\n\nPOSITIVE LOCKS\nWhite-and-red armored figure with red-striped visor and red-armored figure with red visor stay identical in every cut. Neon cyberpunk street and hazed skyline consistent throughout. He offers the hand, she touches, he grabs and lifts - the beat reads as protective and close. Neon stays the dominant saturated color. Both stay locked in the embrace through the flight.',
  'single continuous shot, one take no cuts, cinematic oner, raw hand-held kinetic camera, extreme macro coverage, cinematic lighting, photorealistic, 35mm film quality, professional color grading, sharp focus, high detail texture, film grain, depth of field mastery, ARRI ALEXA aesthetic, The Substance visual style\nExtreme macro of a single living human eye filling the frame for the entire unbroken take, the camera holding at a fixed macro distance with no push-in, never leaving the eye. The shot opens on an immediate visual hook - the eye snapping wide open, the pupil dilating violently and the iris flooding with light. A hazel-green iris with golden-brown striations that shimmer and contract, a wet glossy cornea catching a trembling reflection, fine red veins pulsing and bursting darker across the bloodshot sclera, lashes clumped with smudged black mascara, skin pores and faint wrinkles twitching around the lid. The eye feels alive and panicked - micro-saccades darting, the iris breathing, moisture and a thin trickle of blood welling at the rim, the gaze jerking around in terror. In a fast, horrifying transformation the single black pupil stretches and tears into a second pupil, then a third and a fourth erupt across the iris, multiplying into a cluster of black holes that pulse and writhe. Cold sterile color palette, glossy wet surfaces, grotesque body-horror unease. Raw breathing handheld micro-drift and violent jitter, fixed distance, no zoom, no slow motion, clinical contrast lighting and escalating dread. Sound design: a low ominous drone spiking into shrill stabs, ragged panicked breath, wet organic clicks and tearing flesh as each pupil splits, a final shriek cut to sudden hush.\nSingle continuous shot 6s: The eye snaps wide open in raw extreme macro at a locked-off macro distance, the pupil dilating violently as light floods the hazel-green iris - an instant visual hook - the wet cornea flaring and veins bursting darker across the bloodshot sclera while a ragged panicked breath rips under the spiking drone. The handheld frame jitters and shakes hard, holding its distance as the eye jerks in terror and the central pupil suddenly stretches and tears into a second pupil beside it, wet organic clicks rising. Then in fast brutal succession a third and fourth black pupil erupt and split across the writhing iris, multiplying into a pulsing cluster of dark holes, moisture and a thin trickle of blood welling at the rim, the eye twitching wildly, flesh tearing in the sound and a shrill stab spiking before a sudden hush as the cluster locks in, reflections shivering across the glossy cornea.\nTotal: 6s / 1 shot / 21:9',
  'Sweeping wide shot of a vast crowd flooding across a sprawling harbor dock toward waiting ships as massive cranes loom overhead. Handheld camera moves through the crush with an urgent shake, snapping from a river of people hauling bags to ropes snapping taut to gulls scattering off the water. Smoke drifts from a distant stack, the dock trembles under the mass of movement, the whole scene churns with urgency. Cold steel grays and weathered\ntimber, dense large-scale momentum. 16:9, 6 seconds.',
  'Character:\nAnime Girl (Attach Image) a broken cyborg girl, damaged.\n\nEnvironment: a grassy flower hill. 6:30am sunrise\n\n⸻\n\nUltra-premium cinematic production, emotional environmental storytelling, photoreal anime aesthetic, physically based rendering, award-winning cinematography, IMAX composition, volumetric lighting, ray-traced reflections, ultra-realistic vegetation growth, macro environmental detail, rich cinematic color grading, perfect continuity, Lens flare\n⸻\n\nA young woman runs down a sloped hillside covered in wildflowers, her\nmovements weak and uneven, breath visibly labored. \nwind moving through the tall grass and petals.\n\n0-3s: Wide shot, lateral tracking camera running alongside her as she\ndescends the flower-covered slope. Her steps are unsteady, arms loose,\nshoulders sagging with fatigue. Petals scatter under her feet.\n\n3-6s: Medium shot, camera pulls slightly ahead of her, tracking backward.\nHer pace falters - one knee dips, she catches herself, breathing harder, strands of hair sticking to her face.\n\n6-8s: Her foot catches on the uneven ground. Quick reframe as her upper body pitches forward, arms flailing for balance, expression shifting to shock. Camera holds low, just ahead of her fall line.\n\n8-12s: She tumbles and rolls down the slope, limbs loose with momentum, flowers and loose soil kicked up around her. Camera rotates with her roll, low-angle, handheld-style instability, tracking the tumble downhill without cutting away.\n\n12-15s: She comes to a stop at the base of the hill, lying still in the flowers, chest rising and falling. Camera slow push-in on her face - eyes closed, exhausted. Petals continue drifting down around her.\n\nNothing but the character and environment moves - no extra effects.',
  'A dynamic, high-energy cinematic action sequence in an American high school hallway. A fierce and beautiful Western woman with long wavy blonde hair, wearing a baby pink school uniform blazer with school emblem, white shirt, striped tie, pleated plaid skirt, black knee socks, and shoes, is single-handedly fighting multiple male attackers in an intense hallway brawl.\nShe moves with incredible speed, agility, and martial arts skill - spinning, delivering powerful high kicks, punches, and fluid combos that send the larger men flying into lockers, slamming against walls, and crashing to the floor. Papers scatter everywhere across the polished floor. The men are knocked out or defeated one by one as she advances through the hallway.\nThe camera is highly dynamic: low-angle tracking shots, quick pans, dramatic close-ups of her determined face and flowing blonde hair, wide shots showing the chaos, and intense over-the-shoulder action. Cinematic lighting with overhead fluorescent lights, realistic motion blur on fast movements, dramatic hair whip effects, and intense facial expressions. She looks powerful, confident, and slightly breathless by the end, standing amid the fallen opponents while looking directly forward with focus.\nRealistic live-action style, high detail, intense choreography similar to action film fight scenes, 14-second duration, 16:9 aspect ratio.',
  'Pure first-person camera perspective, no drone, no aircraft visible. The camera flies through an endless ancient library where books orbit like planets and staircases constantly rebuild themselves. Every page releases glowing memories that become physical worlds. The camera dives through thousands of floating books, entering different realities every second: medieval castles, cyberpunk cities, alien deserts, underwater civilizations. The worlds blend together without cuts. Final reveal: every universe collapses into a single floating clock whose gears are entire galaxies rotating in perfect synchronization. Continuous POV, impossible architecture, seamless transitions, cinematic lighting, volumetric dust, premium Hollywood VFX.',
  "Presented in the style of raw iPhone handheld video footage, all camera settings are automatic. The frame includes realistic handheld shaking and operator breathing sensation, with auto-focus frequently searching and delaying between the beauty and the giant crab. Automatic white balance naturally switches between the night theater lighting and screen cold light, but with a clash of three colors: deep red velvet warm tone × cold blue seawater light × emerald green exit light. The image is flat, retaining realistic lens flares, slight overexposure of skin highlights, glass reflections, water marks, motion blur, and faint film grain. Use only in-camera natural environmental sound effects: audience screams, seats overturning, seawater crashing, footsteps, clothes rustling, and mobile phone microphone compression. Employs a real passer-by/live broadcast handheld shooting perspective, with occasionally imperfect composition in 9:16 vertical format. Character fully locked to reference: an elegant Asian beauty in her 20s [hf_20260702_144205_fb001d72-a786-4cca-bcb6-f3a94335c3e3], with delicate light makeup, clear sharp eyes, wearing a black stiletto high heel, facial features locked without distortion, clothing cut and material consistent, back of hair slightly wet from water vapor but hairstyle structure unchanged. 0-2s: Reverse mid-close shot from the screen direction, in the center of the theater, the beauty sits alone, legs elegantly crossed, fingertips resting on the edge of a popcorn bucket on the armrest, the screen showing a deep-sea documentary, cold blue light flowing on her face, reflecting a focused and quiet profile and the ocean reflection in her pupils. Silhouette of scattered audience members. Camera slowly zooms in on her face, slight auto-focus delay-suddenly, her pupils shrink slightly: something is wrong with the sea on the screen. 2-4s: Cut to front perspective, the sea in the screening screen bulges towards the audience, the whole screen like a glass water wall pushed out by internal pressure, with distorted reflected footage flowing on the surface, then bursting with a roar! Hundreds of tons of seawater smash into the audience in a fan shape, the first three rows of seats are uprooted by the water wall, the audience screams and flees. The beauty is lifted from her seat by the shockwave, instinctively grabbing the back of a chair to steady herself, the popcorn bucket flying out. Handheld camera retreats to follow, intense controllable shaking, large water droplets hit the lens forming real water mark flares, automatic exposure jumps. 4-7s: Ultra-low angle worm's-eye view, close to the flooded floor. The giant crab [hf_20260703_200157_a756818c-ea94-4c9e-9ed7-838aba5b677b] slowly crawls out from the screen gap and white waves-giant claws first crush the front row seat frames, spiked carapace pushes away screen debris, eight limbs land in sequence creating circular ripples. It faces the audience, mouthparts open, emitting a low-frequency roar, the sound pressure shaking water mist, wood splinters, popcorn, and paper cups into the air. Zoom in on mouthpart close-up, foreground out-of-focus fleeing figures intensify the building-like scale of oppression. In a corner: the beauty does not flee, but crouches low between seat gaps, calmly observing the crab's movement rhythm. 7-11s: Climax enters ultra-slow motion freeze. One giant claw of the crab is about to smash towards the beauty, waves hang in the air like a transparent wall, scattered water drops, broken chairs, popcorn buckets, and terrified audience expressions are all frozen. The camera smoothly orbits through suspended water droplets, passing close to the crab's spiked shell and giant claw tip, the beauty leaps in mid-air, having already removed one high heel, eyes calmly locked on the crab, in extreme contrast to the surrounding chaos, auto-focus search delay. 11-15s: Time restores with slight ghosting, outer water droplets subtly retreat half a beat then accelerate falling, other objects thaw in sequence. The beauty's toes tap onto a tilted chair back, using the force to leap diagonally onto the outer side of the crab's claw arm, precisely avoiding the smash trajectory. The giant claw crushes a whole row of seats, a second wave of water explodes. The camera follows her at high speed against the crab shell as she dashes upward, shell spikes and water marks flying across the frame edge, ending in a low-angle close-up just before she jumps onto the crab's back. The image presents an authentic unprocessed iPhone handheld video texture, documentary-level natural imperfection, without any post-color grading or special effects. All camera behaviors conform to real iPhone automatic shooting physical characteristics. Realistic 8K: realistic fluid simulation of seawater (foam, spray, surface tension), moist specular reflection of the crab shell, rigid body destruction of seats following physics, realistic refraction of slow-motion water drops, natural light ratio transition between the quiet start and disaster sections, consistent character face throughout, no gore, action is thrilling but clean. Negative prompt: no cartoon plastic texture crab, no game engine feel, no facial distortion or face swap, no clothing drift or design change, no physical weightlessness errors, no inconsistent proportions, no overexposure, no text watermarks, plastic-like skin, smooth poreless or textureless skin, unnatural symmetry, deformed anatomy, bad physics, floating mutated features, cartoonish, gamified, exaggerated sexiness, disproportionate body, facial deformation, clothing drift, low quality, blurry, blemishes, deformed hands, extra fingers, inconsistent lighting, cookie-cutter beauty, over-smoothed skin, perfect symmetry, studio lighting, plastic sheen, deformed proportions, extra details, inconsistent style.",
  'High-end cinematic 3D realism fused with dark smoke-sculpt action. High-sakuga anime choreography, rolling black smoke, dissolving vapor masses, turbulent ash clouds and ghostlike particulate trails define every movement. Extreme perspective, dramatic foreshortening, cinematic tracking shots, low-key lighting, dense atmospheric haze and explosive smoke eruptions replace conventional visual effects, while realistic materials and feature-film rendering preserve depth, weight and scale. A colossal smoke creature rises in a ruined Edo street, its body constantly reshaping into claws, horns and twisting vapor limbs between broken wooden houses and swaying paper lanterns. As it moves through the night haze, it pulls ash, dust and roof debris into its mass before collapsing into a violent black plume.',
  "15-second ultra-cinematic mythological transformation sequence atop a towering mountain summit above the clouds during sunrise.\n\nA lone warrior stands on the edge of an ancient stone peak overlooking endless mountain ranges. Golden sunlight slowly breaks through the clouds while powerful alpine winds whip across the summit. Eagles circle far below.\n\nThe atmosphere is majestic, sacred, and grounded.\n\nThe camera slowly circles around the warrior as a distant eagle cry echoes across the mountains. The wind intensifies, carrying thousands of golden feathers through the air.\n\nThe transformation begins.\n\nThe warrior's eyes sharpen into piercing amber predator eyes. Fine golden feathers emerge naturally across the arms, shoulders, and neck. Muscles become leaner and more athletic while the posture grows proud and commanding.\n\nThe camera moves closer as powerful avian talons gradually replace the hands. Intricate feathers spread across the forearms and chest while dense golden fur develops along the legs, torso, and back.\n\nThe transformation accelerates.\n\nThe spine reshapes. Massive feathered wings erupt from the shoulder blades, unfolding layer by layer with thousands of individually animated feathers reacting naturally to the mountain wind.\n\nThe lower body becomes increasingly leonine. Powerful feline muscles ripple beneath thick golden fur. A long lion tail forms naturally behind the body while enormous eagle talons grip the stone summit.\n\nThe surrounding environment responds. Mountain winds spiral around the transforming figure. Loose rocks lift briefly from the ground. Clouds part as sunlight floods the summit.\n\nAt the climax, the warrior becomes the Griffin Lord-a magnificent fusion of golden eagle and mountain lion. Towering feathered wings stretch across the cliff edge while every feather catches the morning light. The creature radiates the calm authority of an ancient guardian.\n\nFinal cinematic moment: the Griffin Lord launches from the summit with a single colossal wingbeat. The camera follows as it glides effortlessly above endless mountain peaks, soaring through the clouds while the rising sun silhouettes its immense wings against the sky.\n\nStyle: ultra-cinematic mythological realism, photoreal griffin anatomy, realistic feather and fur simulation, grounded biological transformation, alpine mountain atmosphere, golden sunrise lighting, majestic aerial cinematography, AAA fantasy film quality, no text, no overlays.\n\nAudio: epic mythological orchestral score, soaring choir, powerful wingbeats, alpine winds, distant eagle cries, lion growls, rock debris, cinematic mountain ambience, triumphant crescendo.",
  'Mei the Gunslinger = <<<Image1>>> Mei rides a horse alongside a train in the Old West. In a spectacular stunt, she jumps from her horse on to a train carriage. Warm color grade. Desaturated. Arri Alexa 35mm.',
  'Dense redwood forest during heavy fog. A wildlife photographer spends the night inside a fire watch tower. Everything seems normal. Until dawn. Entire sections of the forest have moved. Mountains are unchanged. The roads are unchanged. But the trees are somewhere else. Then he sees it. Far away. An entire forest walking. Thousands of trees moving together. Roots lifting from the ground. Branches swaying. The visible danger grows: highways disappear beneath advancing trees radio towers vanish inside the moving forest rivers change direction abandoned houses become engulfed The photographer drives desperately through foggy roads. Behind him: The living forest slowly advances. At sunset giant trunks tower above the highway. Then the movement stops. The forest stands silent. As if it had never moved.',
  '10-second cinematic sci-fi action sequence, 16:9, ultra-realistic, breathtaking scale, realistic physics, no visible face.\nA fighter flies through a gigantic artificial world.\nThe interior contains continents, cities and oceans.\nSuddenly a planetary defense system activates.\nEnormous armored plates begin sliding across the sky.\nEach plate is hundreds of kilometers wide.\nThe world is literally closing.\nSunlight disappears section by section.\nThe pilot races through narrowing corridors of light.\nEntire landscapes vanish beneath moving armor.\nThe remaining opening becomes smaller and smaller.\nThe fighter dives toward the last visible gap.\nThe planetary shutters collide behind him.\nCut.',
  '0:00-0:02 | Hook - Walking Selfie\nHandheld selfie vlog. Young woman already walking through the Marais under golden autumn trees. She smiles naturally, then looks ahead. Copper hair moves in the breeze, a maple leaf drifts past the lens. Warm golden-hour light, realistic skin, subtle handheld sway.\n0:02-0:04 | Street Reveal\nWithout cutting, she rotates the camera to reveal charming cafés, patisserie windows, cobblestone streets, and falling leaves, then smoothly turns back to herself. Natural autofocus breathing.\n0:04-0:06 | Café Moment\nShe pauses beside a café table. Camera tilts to a steaming café au lait with leaf latte art, then back to her as she gazes down the street before softly meeting the lens.\n\n0:06-0:08 | Autumn Detail\nCamera tilts to a maple leaf on the cobblestones. She picks it up, holding it toward the lens. Focus shifts from the leaf to her face as she smiles gently.\n0:08-0:10 | Follow Shot\nThird-person follow shot as she walks between cafés and golden trees. She glances back over her shoulder with a subtle smile before continuing.\n0:10-0:12 | Selfie Landmark\nSelfie shot in Champ de Mars. The Eiffel Tower rises behind her. She laughs naturally and points toward the tower as her hair moves in the wind.\n0:12-0:14 | Park Reveal\nSmooth wrist-pan revealing the Eiffel Tower, autumn trees, couples relaxing on the lawn, and leaves drifting through the frame.\n0:14-0:15 | Quiet Moment\nSide-profile shot on a park bench. She holds a travel coffee, slowly takes a sip while admiring the Eiffel Tower. Warm golden-hour light, peaceful cinematic ending.\n\nStyle: Ultra-realistic, 16:9, handheld DJI Osmo Pocket 3 feel, cinematic autumn lighting, natural movement, no AI artifacts.',
  'Generate a Video: SCENE 10 - THE LAST RECORDING\nAttachments:\nCITY ANOMALY (Environment Reference)\nMAIN CHARACTER (Character Appearance)\nDuration:\n10 seconds\nAudio:\nHeavy breathing.\nRunning footsteps.\nPeople screaming.\nCar alarms.\nDeep distant rumbling.\nConcrete collapsing.\nWind.\nNo background music.\nPrompt\nSource images are only used as visual references.\nMaintain the colossal anomaly exactly as shown in the reference image.\nTransform into fully photorealistic live-action footage.\nUltra realistic.\nTrue live action.\nAuthentic found-footage.\nReal handheld recording.\nGrounded cinematic realism.\nOne continuous shot.\nNatural handheld instability.\nStrong motion blur during running.\nNatural autofocus hunting.\nNo cuts.\nNo teleportation.\nNo CGI look.\nNo visual effects.\nThe recording begins in unstable accidental selfie view while the operator continues sprinting through the crowded city. Only part of the operator\'s terrified face is visible as the camera violently shakes with every step. Heavy breathing dominates the audio.\nThe operator gasps,\n"No… no… keep going!"\nThe camera suddenly jerks downward as the operator trips and falls hard onto the pavement.\nThe recording tumbles across the ground before coming to rest on its side, pointing upward toward the skyline. The operator scrambles back to their feet and runs out of frame, leaving the camera behind.\nFor a brief moment, only the sky and surrounding skyscrapers are visible.\nThen the impossibly colossal organic hand, exactly matching the attached reference image, slowly descends through the storm clouds in the distance.\nThe enormous hand slams into the skyline far away, sending a massive shockwave through the city. Buildings disappear behind towering clouds of dust and debris as thick smoke rapidly fills the horizon. Orange firelight flickers deep within the expanding dust cloud while the sky darkens.\nThe camera remains abandoned on the ground, trembling slightly from the distant impact.\nDust begins drifting toward the lens.\nThe image becomes increasingly obscured by smoke and airborne debris.\nThe recording abruptly cuts to black, as if the device stopped recording or lost signal at the worst possible moment.',
  'A charismatic French superstar with sharp golden eyes, dark windswept hair, blue France jersey covered in grass stains, intense determined expression, rendered in ultra-premium Japanese sports anime rendering, manga-style visual language, MAPPA-inspired sakuga animation, sharp anime linework, high-contrast cel shading, hand-drawn speed lines, explosive impact frames, exaggerated perspective distortion, dynamic motion smears, dramatic facial close-ups, glowing aura VFX, vibrant anime color grading, cinematic anime lighting, epic shonen sports climax \n- Receives the ball near midfield during a FIFA World Cup 2026 match against Senegal, camera tracking low beside the ball while two Senegalese midfielders sprint toward him; \n- Accelerates forward, beating the first Senegalese midfielder with a body feint, nutmegging a second, then slipping between two Senegalese defenders as blue energy trails and speed lines explode across the field, camera orbiting around every touch while the crowd rises to its feet; \n- Enters the final third with the ball still under close control at his feet, one Senegalese defender sliding across the grass, another attempting a shoulder challenge, a final Senegalese center-back stepping directly into his path, but the French star taps the ball past him and creates shooting space at the edge of the box; \n Clearly plants his left foot beside the ball, swings his right leg through a powerful football shooting motion, strikes the ball cleanly with the laces of his boot in a devastating right-foot instep shot, full kicking follow-through, the ball exploding forward like a blue comet wrapped in dragon-shaped energy, the Senegal goalkeeper reacts and dives at full extension but cannot reach it, the shot smashing into the top corner and violently rippling the net, stadium erupting as teammates sprint toward him while the camera rises above a sea of French flags and confetti, ending on a heroic anime freeze-frame of the scorer after the goal.',
  'cinematic street racing sequence at night, a focused driver inside a high-performance car grips the steering wheel, intense eye focus, city lights reflecting on windshield, tension building before sudden acceleration\n\ncamera: rapid multi-angle system with seamless transitions, interior close-up → over-the-shoulder → exterior tracking → low ground shots, ultra dynamic camera movement, whip pans + speed ramp transitions + motion blur masking cuts, continuous flow illusion\n\n(0-2s) interior close-up on driver, hand tightens on gear shift, subtle breathing, dashboard lights glowing\n(2-4s) over-the-shoulder shot, road ahead stretching into neon-lit city, engine vibration building\n(4-6s) extreme close-up on finger pressing NOS button, instant ignition reaction\n(6-8s) explosive acceleration, camera snaps to exterior side tracking shot, car launches forward with violent speed surge\n(8-10s) ultra low ground shot near asphalt, wheels spinning at extreme velocity, environment streaking past\n(10-12s) high-speed chase through tight streets, sharp turns, camera whip pans between angles, reflections and light trails enhancing speed\n\nDense urban night environment, wet asphalt reflecting neon lights, tunnel passages, street lights streaking, high-speed city atmosphere\nUltra realistic, fast and furious inspired energy, photorealistic lighting, intense motion blur, high contrast neon reflections, cinematic depth of field, extreme sense of speed, fluid transitions, no distortion, no stretching',
] as const;

const seedanceVideo = (
  file: string,
  title: string,
  label: string,
  prompt: string
): SeedanceVideoAsset => ({
  title,
  label,
  prompt,
  src: `${SEEDANCE_VIDEO_CDN_BASE}/${file}`,
  poster: `${SEEDANCE_VIDEO_CDN_BASE}/posters/${file.replace(/\.mp4$/, '.jpg')}`,
});

export const seedanceVideos: SeedanceVideoAsset[] = [
  seedanceVideo(
    'discover-ramzigalimovs-post-a-higgsfield-community-creation.mp4',
    'Forest butterfly chase',
    'Wildlife',
    seedanceVideoPrompts[0]
  ),
  seedanceVideo(
    'discover-ramzigalimovs-post-a-higgsfield-community-creation-1.mp4',
    'Cybernetic escape',
    'Action',
    seedanceVideoPrompts[1]
  ),
  seedanceVideo(
    'hf-20260622-215133-dcf1196f-3559-40cb-8cd2-ee7c86568b01.mp4',
    'High-speed city hit',
    'Cinematic',
    seedanceVideoPrompts[2]
  ),
  seedanceVideo(
    'hf-20260622-230108-4da468fe-902a-4665-b77d-10acbc27ce97.mp4',
    'Festival stage rush',
    'Music',
    seedanceVideoPrompts[3]
  ),
  seedanceVideo(
    'hf-20260622-203946-f032365c-922c-40d5-b866-3aab1b5a4d1c.mp4',
    'Office takedown',
    'Fight',
    seedanceVideoPrompts[4]
  ),
  seedanceVideo(
    '926b8599-e73d-40a8-8006-51cf29a71c47.mp4',
    'Road chase impact',
    'Vehicle',
    seedanceVideoPrompts[5]
  ),
  seedanceVideo(
    '1783494107189-ao21qw-cinematic-anime-cyborg-running-scene.mp4',
    'Anime cyborg sprint',
    'Anime',
    seedanceVideoPrompts[6]
  ),
  seedanceVideo(
    'high-school-hallway-fight-seedance-2-0-ai-video-prompt-for-cin.mp4',
    'Hallway fight scene',
    'Fight',
    seedanceVideoPrompts[7]
  ),
  seedanceVideo(
    '1783409515201-7v48m7-surreal-infinite-ancient-library-pov.mp4',
    'Ancient library POV',
    'Surreal',
    seedanceVideoPrompts[8]
  ),
  seedanceVideo(
    'realistic-handheld-iphone-cinematic-action-video-seedance-2-0.mp4',
    'Handheld street panic',
    'Phone',
    seedanceVideoPrompts[9]
  ),
  seedanceVideo(
    'edo-street-smoke-creature-seedance-2-0-ai-video-prompt-for-cin.mp4',
    'Edo smoke creature',
    'Fantasy',
    seedanceVideoPrompts[10]
  ),
  seedanceVideo(
    'mythological-griffin-transformation-sequence-seedance-2-0-ai-v.mp4',
    'Griffin transformation',
    'Myth',
    seedanceVideoPrompts[11]
  ),
  seedanceVideo(
    'wild-west-gunslinger-train-stunt-seedance-2-0-ai-video-prompt.mp4',
    'Western train stunt',
    'Western',
    seedanceVideoPrompts[12]
  ),
  seedanceVideo(
    'living-walking-forest-mystery-seedance-2-0-ai-video-prompt-for.mp4',
    'Walking forest mystery',
    'Nature',
    seedanceVideoPrompts[13]
  ),
  seedanceVideo(
    '1783494120890-dah2uq-sci-fi-planetary-defense-sequence.mp4',
    'Planetary defense',
    'Sci-fi',
    seedanceVideoPrompts[14]
  ),
  seedanceVideo(
    '1783494105780-fwq1wr-autumn-paris-vlog-walking-selfie.mp4',
    'Autumn Paris vlog',
    'Vlog',
    seedanceVideoPrompts[15]
  ),
  seedanceVideo(
    '1783494100853-cywkff-found-footage-city-anomaly.mp4',
    'City anomaly footage',
    'Found footage',
    seedanceVideoPrompts[16]
  ),
  seedanceVideo(
    '1783494108525-9gytst-anime-style-world-cup-football-climax.mp4',
    'World cup anime climax',
    'Sports',
    seedanceVideoPrompts[17]
  ),
  seedanceVideo(
    '1781841298024-ssgqmm-cinematic-street-racing-sequence-for-seedance-2.mp4',
    'Street racing sequence',
    'Racing',
    seedanceVideoPrompts[18]
  ),
];

export const whatsNew: ShowcaseCard[] = [
  {
    title: 'Seedance 2.5 Film Studio',
    label: 'Cinematic scenes',
    image: showcaseImage('gpt-image-2-prompt-12.jpg'),
    accent: 'from-[#d8f269]/5 to-[#11140f]/78',
  },
  {
    title: 'Magic Text',
    label: 'Poster campaigns',
    image: showcaseImage('gpt-image-2-prompt-15.jpg'),
    accent: 'from-[#a86642]/10 to-[#11140f]/78',
  },
  {
    title: 'Seedance 2.5 Audio',
    label: 'Voice and music',
    image: '/imgs/features/music-dark.png',
    accent: 'from-[#6f7f1f]/14 to-[#090b08]/78',
  },
  {
    title: 'Seedance 2.5 GPT Image 2',
    label: 'Next-gen image model',
    image: showcaseImage('gpt-image-2-prompt-06.jpg'),
    accent: 'from-[#d8f269]/8 to-[#090b08]/78',
  },
];

export const videoTiles: VisualCard[] = [
  {
    title: 'Seedance 2.5',
    description: 'Fast cinematic motion from a single prompt.',
    image: '/imgs/features/reference-showcase-1.webp',
    href: '/video-generator',
    label: 'Motion',
  },
  {
    title: 'Kling 3 Pro',
    description: 'Sharper camera moves for product and action clips.',
    image: '/imgs/features/reference-showcase-2.webp',
    href: '/video-generator',
    label: 'Camera',
  },
  {
    title: 'Veo 3.1 Lite',
    description: 'Quick drafts for social cuts and vertical ideas.',
    image: '/imgs/features/reference-showcase-3.webp',
    href: '/video-generator',
    label: 'Draft',
  },
  {
    title: 'PixVerse v6',
    description: 'Stylized motion for music, fashion, and ads.',
    image: '/imgs/features/reference-showcase-4.webp',
    href: '/video-generator',
    label: 'Style',
  },
];

export const modelCards: VisualCard[] = [
  {
    title: 'Seedance 2.5',
    description: 'Seedance 2.5 Video Generate for cinematic clips',
    image: '/imgs/features/reference-showcase-1.webp',
    href: '/video-generator',
    label: 'Video',
  },
  {
    title: 'Kling Motion',
    description: 'Character movement and camera control',
    image: '/imgs/features/reference-showcase-2.webp',
    href: '/video-generator',
    label: 'Trending',
  },
  {
    title: 'GPT Image 2',
    description: 'Seedance 2.5 Image Generate with crisp text',
    image: showcaseImage('gpt-image-2-prompt-07.jpg'),
    href: '/image-generator',
    label: 'Image',
  },
  {
    title: 'Nano Banana',
    description: 'nanobanana image edits and remixing',
    image: showcaseImage('gpt-image-2-prompt-13.jpg'),
    href: '/image-generator',
    label: 'New',
  },
  {
    title: 'Film Studio',
    description: 'Build scenes, boards, and sequences',
    image: showcaseImage('gpt-image-2-prompt-12.jpg'),
    href: '/image-generator',
    label: 'Studio',
  },
  {
    title: 'Marketing Studio',
    description: 'Product visuals and campaign assets',
    image: showcaseImage('gpt-image-2-prompt-18.jpg'),
    href: '/image-generator',
    label: 'Brand',
  },
];

export const imageGalleryItems: GalleryItem[] = [
  {
    src: showcaseImage('gpt-image-2-prompt-01.webp'),
    alt: 'Cinematic crosswalk portrait generated with GPT Image 2',
    width: 896,
    height: 1200,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-02.webp'),
    alt: 'Tanabata morning portrait generated with GPT Image 2',
    width: 799,
    height: 1200,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-03.webp'),
    alt: 'Parisian fashion bicycle portrait generated with GPT Image 2',
    width: 686,
    height: 1200,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-04.webp'),
    alt: 'Soft afternoon indoor portrait generated with GPT Image 2',
    width: 900,
    height: 1200,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-05.webp'),
    alt: 'Anime martial arts battle generated with GPT Image 2',
    width: 900,
    height: 720,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-06.jpg'),
    alt: 'BIWA anime character sheet generated with GPT Image 2',
    width: 900,
    height: 507,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-07.jpg'),
    alt: 'Five-slice emotional fashion portrait generated with GPT Image 2',
    width: 900,
    height: 900,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-08.jpg'),
    alt: 'Tanabata manga page generated with GPT Image 2',
    width: 675,
    height: 1200,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-09.jpg'),
    alt: 'Retro Y2K computer workspace portrait generated with GPT Image 2',
    width: 800,
    height: 1200,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-10.jpg'),
    alt: "Worm's-eye editorial fashion portrait generated with GPT Image 2",
    width: 456,
    height: 570,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-11.jpg'),
    alt: 'Cinematic city running poster generated with GPT Image 2',
    width: 900,
    height: 503,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-12.jpg'),
    alt: 'Layered editorial action poster generated with GPT Image 2',
    width: 900,
    height: 1200,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-13.jpg'),
    alt: 'Selective color street photography generated with GPT Image 2',
    width: 900,
    height: 1125,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-14.jpg'),
    alt: 'Korean phone photo strip generated with GPT Image 2',
    width: 800,
    height: 1200,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-15.jpg'),
    alt: 'Japanese design magazine poster generated with GPT Image 2',
    width: 825,
    height: 1024,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-16.jpg'),
    alt: 'Bold commercial poster generated with GPT Image 2',
    width: 900,
    height: 1200,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-17.jpg'),
    alt: 'Editorial product campaign generated with GPT Image 2',
    width: 900,
    height: 985,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-18.jpg'),
    alt: 'Luxury fashion editorial portrait generated with GPT Image 2',
    width: 900,
    height: 1125,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-19.jpg'),
    alt: 'Cinematic character portrait generated with GPT Image 2',
    width: 675,
    height: 1200,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-20.jpg'),
    alt: 'Fantasy whimsical downtown aerial view generated with GPT Image 2',
    width: 900,
    height: 507,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-21.jpg'),
    alt: 'High-detail cinematic image generated with GPT Image 2',
    width: 900,
    height: 511,
  },
  {
    src: showcaseImage('gpt-image-2-prompt-22.jpg'),
    alt: 'Identity card macro photo generated with GPT Image 2',
    width: 900,
    height: 569,
  },
];

export const hotTopics = [
  'Seedance 2.5',
  'Video Generate',
  'Image Generate',
  'Seedance 2.5',
  'nanobanana',
  'GPT Image 2',
  'Cinema Studio',
  'Nano Banana',
  'Kling camera control',
  'GPT Image',
  'Product placement',
  'Fashion studio',
  'AI influencer',
  'Visual effects',
  'Commercial ads',
  'Shorts Studio',
  'Multi reference',
  'Upscale',
  'Image to video',
  'Viral presets',
  'Sora clips',
  'Flux Kontext',
  'Seedance Pro',
];
