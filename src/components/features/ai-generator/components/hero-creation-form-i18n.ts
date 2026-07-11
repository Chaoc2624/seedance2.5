type HeroCreationFormCopy = {
  modeAriaLabel: string;
  minimizeComposer: string;
  describePrompt: string;
  features: string;
  selectModel: string;
  model: string;
  versions: (count: number) => string;
  openSettings: string;
  clearInput: string;
  generate: string;
  generateForCredits: (credits: number) => string;
  upload: {
    reference: string;
    image: string;
    video: string;
    start: string;
    end: string;
    media: string;
    referenceImage: string;
    referenceVideo: string;
    startFrame: string;
    endFrame: string;
    sourceVideo: string;
  };
  placeholders: {
    textImage: string;
    referenceImage: string;
    agent: string;
    referenceVideo: string;
    framesVideo: string;
    videoEdit: string;
    default: string;
  };
  settings: {
    videoLength: string;
    resolution: string;
    aspectRatio: string;
    mode: string;
    quality: string;
    format: string;
    images: string;
    outputCount: string;
    chooseDuration: string;
  };
};

const en: HeroCreationFormCopy = {
  modeAriaLabel: 'Creation type',
  minimizeComposer: 'Minimize composer',
  describePrompt: 'Describe what you want to create',
  features: 'Features',
  selectModel: 'Select model',
  model: 'Model',
  versions: (count) => `${count} versions`,
  openSettings: 'Open generation settings',
  clearInput: 'Clear prompt and uploaded assets',
  generate: 'Generate',
  generateForCredits: (credits) => `Generate for ${credits} credits`,
  upload: {
    reference: 'Reference',
    image: 'Image',
    video: 'Video',
    start: 'Start',
    end: 'End',
    media: 'Media',
    referenceImage: 'Upload reference image',
    referenceVideo: 'Upload reference video',
    startFrame: 'Upload start frame',
    endFrame: 'Upload end frame',
    sourceVideo: 'Upload source video',
  },
  placeholders: {
    textImage: 'Describe the image you want to generate...',
    referenceImage: 'Upload a reference image, then describe the result...',
    agent: 'Describe the campaign or asset system you need...',
    referenceVideo:
      'Upload images or videos, then describe how they should move...',
    framesVideo: 'Add start and end frames, then describe the transition...',
    videoEdit: 'Upload a video, then describe the edit...',
    default: 'Enter your idea to generate...',
  },
  settings: {
    videoLength: 'Video length',
    resolution: 'Resolution',
    aspectRatio: 'Aspect ratio',
    mode: 'Mode',
    quality: 'Quality',
    format: 'Format',
    images: 'Images',
    outputCount: 'Output count',
    chooseDuration: 'Choose duration',
  },
};

const copies: Record<string, HeroCreationFormCopy> = {
  en,
  de: {
    ...en,
    modeAriaLabel: 'Erstellungstyp',
    minimizeComposer: 'Composer minimieren',
    describePrompt: 'Beschreibe, was du erstellen willst',
    features: 'Funktionen',
    selectModel: 'Modell waehlen',
    model: 'Modell',
    versions: (count) => `${count} Versionen`,
    openSettings: 'Generierungseinstellungen oeffnen',
    clearInput: 'Prompt und Uploads loeschen',
    generate: 'Generieren',
    generateForCredits: (credits) => `Fuer ${credits} Credits generieren`,
    upload: {
      reference: 'Referenz',
      image: 'Bild',
      video: 'Video',
      start: 'Start',
      end: 'Ende',
      media: 'Medien',
      referenceImage: 'Referenzbild hochladen',
      referenceVideo: 'Referenzvideo hochladen',
      startFrame: 'Startbild hochladen',
      endFrame: 'Endbild hochladen',
      sourceVideo: 'Quellvideo hochladen',
    },
    placeholders: {
      textImage: 'Beschreibe das Bild, das du generieren willst...',
      referenceImage:
        'Lade ein Referenzbild hoch und beschreibe das Ergebnis...',
      agent: 'Beschreibe die Kampagne oder das Asset-System...',
      referenceVideo:
        'Lade Bilder oder Videos hoch und beschreibe die Bewegung...',
      framesVideo:
        'Fuege Start- und Endbild hinzu und beschreibe den Uebergang...',
      videoEdit: 'Lade ein Video hoch und beschreibe die Bearbeitung...',
      default: 'Gib deine Idee zum Generieren ein...',
    },
    settings: {
      videoLength: 'Videolaenge',
      resolution: 'Aufloesung',
      aspectRatio: 'Seitenverhaeltnis',
      mode: 'Modus',
      quality: 'Qualitaet',
      format: 'Format',
      images: 'Bilder',
      outputCount: 'Anzahl',
      chooseDuration: 'Dauer waehlen',
    },
  },
  fr: {
    ...en,
    modeAriaLabel: 'Type de creation',
    minimizeComposer: 'Reduire le composeur',
    describePrompt: 'Decrivez ce que vous voulez creer',
    features: 'Fonctionnalites',
    selectModel: 'Choisir un modele',
    model: 'Modele',
    versions: (count) => `${count} versions`,
    openSettings: 'Ouvrir les reglages de generation',
    clearInput: 'Effacer le prompt et les fichiers',
    generate: 'Generer',
    generateForCredits: (credits) => `Generer pour ${credits} credits`,
    upload: {
      reference: 'Reference',
      image: 'Image',
      video: 'Video',
      start: 'Debut',
      end: 'Fin',
      media: 'Media',
      referenceImage: 'Importer une image de reference',
      referenceVideo: 'Importer une video de reference',
      startFrame: 'Importer l image de debut',
      endFrame: 'Importer l image de fin',
      sourceVideo: 'Importer la video source',
    },
    placeholders: {
      textImage: 'Decrivez l image a generer...',
      referenceImage:
        'Importez une image de reference puis decrivez le resultat...',
      agent: 'Decrivez la campagne ou le systeme de contenus...',
      referenceVideo:
        'Importez des images ou videos puis decrivez le mouvement...',
      framesVideo:
        'Ajoutez une image de debut et de fin puis decrivez la transition...',
      videoEdit: 'Importez une video puis decrivez la modification...',
      default: 'Saisissez votre idee a generer...',
    },
    settings: {
      videoLength: 'Duree video',
      resolution: 'Resolution',
      aspectRatio: 'Format',
      mode: 'Mode',
      quality: 'Qualite',
      format: 'Format',
      images: 'Images',
      outputCount: 'Nombre',
      chooseDuration: 'Choisir la duree',
    },
  },
  es: {
    ...en,
    modeAriaLabel: 'Tipo de creacion',
    minimizeComposer: 'Minimizar compositor',
    describePrompt: 'Describe lo que quieres crear',
    features: 'Funciones',
    selectModel: 'Elegir modelo',
    model: 'Modelo',
    versions: (count) => `${count} versiones`,
    openSettings: 'Abrir ajustes de generacion',
    clearInput: 'Borrar prompt y archivos',
    generate: 'Generar',
    generateForCredits: (credits) => `Generar por ${credits} creditos`,
    upload: {
      reference: 'Referencia',
      image: 'Imagen',
      video: 'Video',
      start: 'Inicio',
      end: 'Final',
      media: 'Medio',
      referenceImage: 'Subir imagen de referencia',
      referenceVideo: 'Subir video de referencia',
      startFrame: 'Subir fotograma inicial',
      endFrame: 'Subir fotograma final',
      sourceVideo: 'Subir video fuente',
    },
    placeholders: {
      textImage: 'Describe la imagen que quieres generar...',
      referenceImage:
        'Sube una imagen de referencia y describe el resultado...',
      agent: 'Describe la campana o sistema de assets que necesitas...',
      referenceVideo: 'Sube imagenes o videos y describe como deben moverse...',
      framesVideo: 'Agrega inicio y final, luego describe la transicion...',
      videoEdit: 'Sube un video y describe la edicion...',
      default: 'Escribe tu idea para generar...',
    },
    settings: {
      videoLength: 'Duracion',
      resolution: 'Resolucion',
      aspectRatio: 'Relacion',
      mode: 'Modo',
      quality: 'Calidad',
      format: 'Formato',
      images: 'Imagenes',
      outputCount: 'Cantidad',
      chooseDuration: 'Elegir duracion',
    },
  },
  it: {
    ...en,
    modeAriaLabel: 'Tipo di creazione',
    minimizeComposer: 'Riduci composer',
    describePrompt: 'Descrivi cosa vuoi creare',
    features: 'Funzioni',
    selectModel: 'Scegli modello',
    model: 'Modello',
    versions: (count) => `${count} versioni`,
    openSettings: 'Apri impostazioni di generazione',
    clearInput: 'Cancella prompt e upload',
    generate: 'Genera',
    generateForCredits: (credits) => `Genera per ${credits} crediti`,
    upload: {
      reference: 'Riferimento',
      image: 'Immagine',
      video: 'Video',
      start: 'Inizio',
      end: 'Fine',
      media: 'Media',
      referenceImage: 'Carica immagine di riferimento',
      referenceVideo: 'Carica video di riferimento',
      startFrame: 'Carica frame iniziale',
      endFrame: 'Carica frame finale',
      sourceVideo: 'Carica video sorgente',
    },
    placeholders: {
      textImage: 'Descrivi l immagine da generare...',
      referenceImage: 'Carica un riferimento e descrivi il risultato...',
      agent: 'Descrivi la campagna o il sistema di asset...',
      referenceVideo: 'Carica immagini o video e descrivi il movimento...',
      framesVideo:
        'Aggiungi frame iniziale e finale e descrivi la transizione...',
      videoEdit: 'Carica un video e descrivi la modifica...',
      default: 'Inserisci la tua idea da generare...',
    },
    settings: {
      videoLength: 'Durata video',
      resolution: 'Risoluzione',
      aspectRatio: 'Formato',
      mode: 'Modalita',
      quality: 'Qualita',
      format: 'Formato',
      images: 'Immagini',
      outputCount: 'Quantita',
      chooseDuration: 'Scegli durata',
    },
  },
  pl: {
    ...en,
    modeAriaLabel: 'Typ tworzenia',
    minimizeComposer: 'Zminimalizuj kompozytor',
    describePrompt: 'Opisz, co chcesz stworzyc',
    features: 'Funkcje',
    selectModel: 'Wybierz model',
    model: 'Model',
    versions: (count) => `${count} wersje`,
    openSettings: 'Otworz ustawienia generowania',
    clearInput: 'Wyczysc prompt i pliki',
    generate: 'Generuj',
    generateForCredits: (credits) => `Generuj za ${credits} kredytow`,
    upload: {
      reference: 'Referencja',
      image: 'Obraz',
      video: 'Wideo',
      start: 'Start',
      end: 'Koniec',
      media: 'Media',
      referenceImage: 'Przeslij obraz referencyjny',
      referenceVideo: 'Przeslij wideo referencyjne',
      startFrame: 'Przeslij klatke startowa',
      endFrame: 'Przeslij klatke koncowa',
      sourceVideo: 'Przeslij wideo zrodlowe',
    },
    placeholders: {
      textImage: 'Opisz obraz, ktory chcesz wygenerowac...',
      referenceImage: 'Przeslij obraz referencyjny i opisz wynik...',
      agent: 'Opisz kampanie lub system assetow...',
      referenceVideo: 'Przeslij obrazy lub wideo i opisz ruch...',
      framesVideo: 'Dodaj klatke startowa i koncowa, opisz przejscie...',
      videoEdit: 'Przeslij wideo i opisz edycje...',
      default: 'Wpisz pomysl do wygenerowania...',
    },
    settings: {
      videoLength: 'Dlugosc wideo',
      resolution: 'Rozdzielczosc',
      aspectRatio: 'Proporcje',
      mode: 'Tryb',
      quality: 'Jakosc',
      format: 'Format',
      images: 'Obrazy',
      outputCount: 'Liczba',
      chooseDuration: 'Wybierz czas',
    },
  },
  ja: {
    ...en,
    modeAriaLabel: '作成タイプ',
    minimizeComposer: '入力欄を最小化',
    describePrompt: '作成したい内容を説明',
    features: '機能',
    selectModel: 'モデルを選択',
    model: 'モデル',
    versions: (count) => `${count} バージョン`,
    openSettings: '生成設定を開く',
    clearInput: 'プロンプトとアップロードを消去',
    generate: '生成',
    generateForCredits: (credits) => `${credits} クレジットで生成`,
    upload: {
      reference: '参照',
      image: '画像',
      video: '動画',
      start: '開始',
      end: '終了',
      media: 'メディア',
      referenceImage: '参照画像をアップロード',
      referenceVideo: '参照動画をアップロード',
      startFrame: '開始フレームをアップロード',
      endFrame: '終了フレームをアップロード',
      sourceVideo: '元動画をアップロード',
    },
    placeholders: {
      textImage: '生成したい画像を説明してください...',
      referenceImage: '参照画像をアップロードして、結果を説明してください...',
      agent: '必要なキャンペーンやアセット構成を説明してください...',
      referenceVideo: '画像や動画をアップロードして、動きを説明してください...',
      framesVideo: '開始と終了フレームを追加し、遷移を説明してください...',
      videoEdit: '動画をアップロードして、編集内容を説明してください...',
      default: '生成したいアイデアを入力してください...',
    },
    settings: {
      videoLength: '動画の長さ',
      resolution: '解像度',
      aspectRatio: 'アスペクト比',
      mode: 'モード',
      quality: '品質',
      format: '形式',
      images: '画像',
      outputCount: '出力数',
      chooseDuration: '長さを選択',
    },
  },
  ko: {
    ...en,
    modeAriaLabel: '생성 유형',
    minimizeComposer: '입력창 최소화',
    describePrompt: '만들고 싶은 내용을 설명하세요',
    features: '기능',
    selectModel: '모델 선택',
    model: '모델',
    versions: (count) => `${count}개 버전`,
    openSettings: '생성 설정 열기',
    clearInput: '프롬프트와 업로드 제거',
    generate: '생성',
    generateForCredits: (credits) => `${credits} 크레딧으로 생성`,
    upload: {
      reference: '참조',
      image: '이미지',
      video: '동영상',
      start: '시작',
      end: '끝',
      media: '미디어',
      referenceImage: '참조 이미지 업로드',
      referenceVideo: '참조 동영상 업로드',
      startFrame: '시작 프레임 업로드',
      endFrame: '끝 프레임 업로드',
      sourceVideo: '원본 동영상 업로드',
    },
    placeholders: {
      textImage: '생성할 이미지를 설명하세요...',
      referenceImage: '참조 이미지를 업로드하고 결과를 설명하세요...',
      agent: '필요한 캠페인이나 에셋 시스템을 설명하세요...',
      referenceVideo: '이미지나 동영상을 업로드하고 움직임을 설명하세요...',
      framesVideo: '시작과 끝 프레임을 추가하고 전환을 설명하세요...',
      videoEdit: '동영상을 업로드하고 편집 내용을 설명하세요...',
      default: '생성할 아이디어를 입력하세요...',
    },
    settings: {
      videoLength: '동영상 길이',
      resolution: '해상도',
      aspectRatio: '화면 비율',
      mode: '모드',
      quality: '품질',
      format: '형식',
      images: '이미지',
      outputCount: '출력 수',
      chooseDuration: '길이 선택',
    },
  },
  'zh-hant': {
    ...en,
    modeAriaLabel: '創作類型',
    minimizeComposer: '最小化輸入框',
    describePrompt: '描述你想創作的內容',
    features: '功能',
    selectModel: '選擇模型',
    model: '模型',
    versions: (count) => `${count} 個版本`,
    openSettings: '開啟生成設定',
    clearInput: '清除提示詞與上傳素材',
    generate: '生成',
    generateForCredits: (credits) => `使用 ${credits} 點數生成`,
    upload: {
      reference: '參考',
      image: '圖片',
      video: '影片',
      start: '開始',
      end: '結束',
      media: '媒體',
      referenceImage: '上傳參考圖片',
      referenceVideo: '上傳參考影片',
      startFrame: '上傳開始畫面',
      endFrame: '上傳結束畫面',
      sourceVideo: '上傳來源影片',
    },
    placeholders: {
      textImage: '描述你想生成的圖片...',
      referenceImage: '上傳參考圖片，然後描述生成結果...',
      agent: '描述你需要的活動或素材系統...',
      referenceVideo: '上傳圖片或影片，然後描述它們如何移動...',
      framesVideo: '加入開始與結束畫面，然後描述轉場...',
      videoEdit: '上傳影片，然後描述要如何編輯...',
      default: '輸入你想生成的想法...',
    },
    settings: {
      videoLength: '影片長度',
      resolution: '解析度',
      aspectRatio: '長寬比',
      mode: '模式',
      quality: '品質',
      format: '格式',
      images: '圖片',
      outputCount: '輸出數量',
      chooseDuration: '選擇長度',
    },
  },
};

copies.zh = copies['zh-hant'];

export function getHeroCreationFormCopy(locale?: string | null) {
  return (locale && copies[locale]) || en;
}

export type { HeroCreationFormCopy };
