// Import modules
import { validators, validateForm, showFieldError, clearFieldError } from './validation.js';
import { sanitizeHTML, createSafeElement, validateDataIntegrity, generateSecureId } from './security.js';
import { initKeyboardNavigation, announce, focusWithAnnouncement, addSkipLink } from './accessibility.js';
import { initTelegramApp, hapticFeedback, showMainButton, hideMainButton, showAlert, isTelegramEnvironment } from './telegram.js';
import { initSupabase, authenticateUser, fetchProjects, createProject as apiCreateProject, updateProject as apiUpdateProject, deleteProject as apiDeleteProject, isOnlineMode } from './api.js';

const STORAGE_KEY = "turist_pro_state_v1";
const BACKUP_KEY = "turist_pro_backup_v1";
const TAB_ID = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const ROLES = {
  owner: "Владелец",
  editor: "Редактор",
  viewer: "Наблюдатель",
};

const BODY_LIMITS = {
  light: 18,
  medium: 22,
  strong: 27,
};

const MEAL_TYPES = ["Завтрак", "Обед", "Ужин", "Перекус"];

const BASE_GEAR_LIBRARY = [
  { name: "Палатка 2-местная", category: "Укрытие", weightKg: 3.2, hint: "Берите тент в дождливый сезон", types: ["hiking"], seasons: ["summer", "autumn"] },
  { name: "Тент", category: "Укрытие", weightKg: 0.8, hint: "Усиливает защиту от осадков", types: ["hiking", "water"], seasons: ["all"] },
  { name: "Спальник", category: "Сон", weightKg: 1.4, hint: "Подбирайте по температуре комфорта", types: ["hiking", "ski"], seasons: ["all"] },
  { name: "Коврик", category: "Сон", weightKg: 0.6, hint: "Для зимы добавляйте R-value > 4", types: ["hiking", "ski", "water"], seasons: ["all"] },
  { name: "Газовая горелка", category: "Кухня", weightKg: 0.45, hint: "Проверяйте совместимость баллонов", types: ["hiking", "ski"], seasons: ["all"] },
  { name: "Котелок", category: "Кухня", weightKg: 0.65, hint: "1 л на 1-2 человека", types: ["hiking", "ski", "water"], seasons: ["all"] },
  { name: "Аптечка", category: "Безопасность", weightKg: 0.35, hint: "Добавьте личные препараты", types: ["hiking", "ski", "water"], seasons: ["all"] },
  { name: "Лавинный набор", category: "Безопасность", weightKg: 1.1, hint: "Датчик+щуп+лопата", types: ["ski"], seasons: ["winter"] },
  { name: "Гермомешок", category: "Водный", weightKg: 0.4, hint: "Защитит еду и электронику", types: ["water"], seasons: ["all"] },
  { name: "Спасжилет", category: "Водный", weightKg: 0.9, hint: "Подбирайте по весу и объему", types: ["water"], seasons: ["all"] },
  { name: "Трекинговые палки", category: "Передвижение", weightKg: 0.5, hint: "Снижают нагрузку на колени", types: ["hiking"], seasons: ["all"] },
  { name: "Кошки и ледоруб", category: "Передвижение", weightKg: 1.8, hint: "Для ледовых участков", types: ["ski"], seasons: ["winter", "spring"] },
];

const RECIPE_LIBRARY = [
  {
    id: "dish_1",
    name: "Овсянка с сухофруктами",
    products: [
      { name: "Овсяные хлопья", gramsPerPerson: 80, kcalPer100: 365, p: 12, f: 6, c: 62 },
      { name: "Сухофрукты", gramsPerPerson: 30, kcalPer100: 280, p: 2, f: 0.5, c: 66 },
      { name: "Орехи", gramsPerPerson: 20, kcalPer100: 610, p: 17, f: 53, c: 11 },
    ],
  },
  {
    id: "dish_2",
    name: "Гречка с тушенкой",
    products: [
      { name: "Гречка", gramsPerPerson: 90, kcalPer100: 343, p: 13, f: 3.4, c: 71 },
      { name: "Тушенка", gramsPerPerson: 120, kcalPer100: 240, p: 15, f: 20, c: 0 },
      { name: "Лук сушеный", gramsPerPerson: 10, kcalPer100: 320, p: 9, f: 1, c: 68 },
    ],
  },
  {
    id: "dish_3",
    name: "Кускус с овощами",
    products: [
      { name: "Кускус", gramsPerPerson: 85, kcalPer100: 376, p: 12, f: 0.6, c: 77 },
      { name: "Овощная смесь", gramsPerPerson: 45, kcalPer100: 280, p: 9, f: 2, c: 52 },
      { name: "Оливковое масло", gramsPerPerson: 10, kcalPer100: 884, p: 0, f: 100, c: 0 },
    ],
  },
  {
    id: "dish_4",
    name: "Суп-лапша",
    products: [
      { name: "Лапша", gramsPerPerson: 80, kcalPer100: 350, p: 12, f: 1.2, c: 72 },
      { name: "Сушеное мясо", gramsPerPerson: 35, kcalPer100: 410, p: 45, f: 20, c: 2 },
      { name: "Сухие овощи", gramsPerPerson: 20, kcalPer100: 290, p: 9, f: 2, c: 58 },
    ],
  },
  {
    id: "dish_5",
    name: "Энергетический перекус",
    products: [
      { name: "Батончик", gramsPerPerson: 55, kcalPer100: 430, p: 8, f: 15, c: 63 },
      { name: "Изотоник", gramsPerPerson: 25, kcalPer100: 380, p: 0, f: 0, c: 95 },
    ],
  },
];

const COMMUNITY_TEMPLATES = [
  {
    id: "tpl_com_1",
    source: "community",
    name: "Лето 3 дня (пеший)",
    type: "hiking",
    season: "summer",
    days: 3,
    entries: [
      { day: 1, mealType: "Завтрак", dishId: "dish_1", servings: 1 },
      { day: 1, mealType: "Ужин", dishId: "dish_2", servings: 1 },
      { day: 2, mealType: "Завтрак", dishId: "dish_1", servings: 1 },
      { day: 2, mealType: "Обед", dishId: "dish_5", servings: 1 },
      { day: 2, mealType: "Ужин", dishId: "dish_3", servings: 1 },
      { day: 3, mealType: "Завтрак", dishId: "dish_1", servings: 1 },
      { day: 3, mealType: "Обед", dishId: "dish_4", servings: 1 },
    ],
  },
  {
    id: "tpl_com_2",
    source: "community",
    name: "Зима 2 дня (лыжный)",
    type: "ski",
    season: "winter",
    days: 2,
    entries: [
      { day: 1, mealType: "Завтрак", dishId: "dish_1", servings: 1.1 },
      { day: 1, mealType: "Обед", dishId: "dish_5", servings: 1.2 },
      { day: 1, mealType: "Ужин", dishId: "dish_2", servings: 1.2 },
      { day: 2, mealType: "Завтрак", dishId: "dish_1", servings: 1.1 },
      { day: 2, mealType: "Обед", dishId: "dish_4", servings: 1.1 },
    ],
  },
];

const FIRST_AID_GUIDE = [
  {
    title: "Переохлаждение",
    steps: "Снимите мокрую одежду, укройте человека, дайте теплое сладкое питье. Согревайте постепенно, не растирайте снегом.",
  },
  {
    title: "Растяжение или ушиб",
    steps: "Покой, холод 10-15 минут, эластичный бинт, подъем конечности. При сильной боли ограничить движение и эвакуировать.",
  },
  {
    title: "Ожог",
    steps: "Охладить чистой прохладной водой 10-20 минут, закрыть стерильной повязкой, не вскрывать пузыри.",
  },
  {
    title: "Порез",
    steps: "Остановить кровотечение давящей повязкой, обработать края антисептиком, следить за чистотой.",
  },
  {
    title: "Укус насекомого",
    steps: "Удалить жало при наличии, обработать место укуса, дать антигистаминное при реакции.",
  },
];

const typeLabel = {
  hiking: "Пеший",
  ski: "Лыжный",
  water: "Водный",
};

const seasonLabel = {
  spring: "Весна",
  summer: "Лето",
  autumn: "Осень",
  winter: "Зима",
};

const bodyLabel = {
  light: "Легкое телосложение",
  medium: "Среднее телосложение",
  strong: "Крепкое телосложение",
};

let uiNotice = null;
let pendingDiaryPhoto = "";
const reminderTimers = new Map();

function uid(prefix = "id") {
  // Use crypto for better security in production
  if (window.crypto && crypto.getRandomValues) {
    return generateSecureId(prefix);
  }
  // Fallback
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function toISODate(offsetDays = 0) {
  const dt = new Date();
  dt.setDate(dt.getDate() + offsetDays);
  return dt.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function calculateDays(project) {
  if (!project?.startDate || !project?.endDate) return 1;
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  const diff = Math.floor((end - start) / 86400000) + 1;
  return Number.isFinite(diff) && diff > 0 ? diff : 1;
}

function getDish(dishId) {
  return RECIPE_LIBRARY.find((dish) => dish.id === dishId);
}

function getProjectParticipantCount(project) {
  return Math.max(project?.participants?.length || 0, 1);
}

function calcEntryNutrition(entry, participantCount) {
  const dish = getDish(entry.dishId);
  if (!dish) {
    return { dishName: "Неизвестное блюдо", grams: 0, calories: 0, protein: 0, fat: 0, carbs: 0, products: [] };
  }

  const totals = {
    dishName: dish.name,
    grams: 0,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    products: [],
  };

  for (const product of dish.products) {
    const grams = product.gramsPerPerson * participantCount * (entry.servings || 1);
    const calories = (grams / 100) * product.kcalPer100;
    const protein = (grams / 100) * product.p;
    const fat = (grams / 100) * product.f;
    const carbs = (grams / 100) * product.c;

    totals.grams += grams;
    totals.calories += calories;
    totals.protein += protein;
    totals.fat += fat;
    totals.carbs += carbs;

    totals.products.push({
      name: product.name,
      day: entry.day,
      mealType: entry.mealType,
      dishName: dish.name,
      grams,
      calories,
      protein,
      fat,
      carbs,
      kcalPer100: product.kcalPer100,
    });
  }

  return totals;
}

function createDemoProject() {
  const ownerId = uid("member");
  const ivanId = uid("member");
  const olgaId = uid("member");
  const projectId = uid("project");

  const project = {
    id: projectId,
    title: "Карпаты: тренировочный поход",
    startDate: toISODate(12),
    endDate: toISODate(15),
    type: "hiking",
    season: "summer",
    bodyType: "medium",
    inviteLink: `https://turist-pro.example/invite/${projectId}`,
    participants: [
      { id: ownerId, name: "Вы", role: "owner" },
      { id: ivanId, name: "Иван", role: "editor" },
      { id: olgaId, name: "Ольга", role: "editor" },
    ],
    chat: [
      { id: uid("msg"), author: "Вы", message: "Собираем базовый список и питание до пятницы.", createdAt: new Date().toISOString() },
      { id: uid("msg"), author: "Иван", message: "Палатку и горелку беру на себя.", createdAt: new Date().toISOString() },
    ],
    gearItems: [
      {
        id: uid("gear"),
        name: "Палатка 2-местная",
        category: "Укрытие",
        weightKg: 3.2,
        responsibleId: ivanId,
        hint: "Проверьте дуги и тент",
        packed: false,
      },
      {
        id: uid("gear"),
        name: "Газовая горелка",
        category: "Кухня",
        weightKg: 0.45,
        responsibleId: olgaId,
        hint: "Проверить резьбу",
        packed: false,
      },
      {
        id: uid("gear"),
        name: "Аптечка",
        category: "Безопасность",
        weightKg: 0.35,
        responsibleId: ownerId,
        hint: "Личные препараты + пластыри",
        packed: true,
      },
    ],
    mealEntries: [
      { id: uid("meal"), day: 1, mealType: "Завтрак", dishId: "dish_1", servings: 1, packed: false },
      { id: uid("meal"), day: 1, mealType: "Ужин", dishId: "dish_2", servings: 1, packed: false },
      { id: uid("meal"), day: 2, mealType: "Обед", dishId: "dish_5", servings: 1, packed: false },
    ],
    diary: [],
    activity: [],
  };

  project.activity.unshift({
    id: uid("act"),
    text: "Проект создан",
    createdAt: new Date().toISOString(),
  });

  return project;
}

function initialState() {
  const demo = createDemoProject();
  return {
    activeModule: "projects",
    currentProjectId: demo.id,
    projects: [demo],
    userTemplates: [],
    tools: {
      waterCalc: null,
    },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();

    const parsed = JSON.parse(raw);

    // Validate data integrity
    if (!validateDataIntegrity(parsed)) {
      console.error('Data integrity check failed, restoring from backup');
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        try {
          const parsedBackup = JSON.parse(backup);
          if (validateDataIntegrity(parsedBackup)) {
            setNotice('Данные восстановлены из резервной копии', 'warn');
            return parsedBackup;
          }
        } catch (e) {
          console.error('Backup restoration failed:', e);
        }
      }
      setNotice('Ошибка загрузки данных, создан новый проект', 'error');
      return initialState();
    }

    // Validate structure
    if (!parsed || !Array.isArray(parsed.projects)) {
      console.warn('Invalid state structure');
      return initialState();
    }

    if (!parsed.projects.length) {
      return initialState();
    }

    // Ensure current project exists
    if (!parsed.currentProjectId || !parsed.projects.some((p) => p.id === parsed.currentProjectId)) {
      parsed.currentProjectId = parsed.projects[0].id;
    }

    // Set defaults
    parsed.activeModule = parsed.activeModule || "projects";
    parsed.userTemplates = parsed.userTemplates || [];
    parsed.tools = parsed.tools || { waterCalc: null };

    return parsed;
  } catch (error) {
    console.error('Error loading state:', error);

    // Try backup
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        const parsedBackup = JSON.parse(backup);
        if (validateDataIntegrity(parsedBackup)) {
          setNotice('Данные восстановлены из резервной копии', 'warn');
          return parsedBackup;
        }
      }
    } catch (e) {
      console.error('Backup restoration failed:', e);
    }

    setNotice('Ошибка загрузки данных, создан новый проект', 'error');
    return initialState();
  }
}

let state = loadState();

const syncChannel = "BroadcastChannel" in window ? new BroadcastChannel("turist-sync-channel") : null;
if (syncChannel) {
  syncChannel.addEventListener("message", (event) => {
    if (!event.data || event.data.tab === TAB_ID) return;
    const nextState = loadState();
    state = nextState;
    render();
  });
}

window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY) return;
  state = loadState();
  render();
});

function saveState() {
  try {
    // Create backup before saving
    const currentData = localStorage.getItem(STORAGE_KEY);
    if (currentData) {
      localStorage.setItem(BACKUP_KEY, currentData);
    }

    // Save new state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Sync across tabs
    if (syncChannel) {
      syncChannel.postMessage({ tab: TAB_ID, ts: Date.now() });
    }
  } catch (error) {
    console.error('Error saving state:', error);
    setNotice('Ошибка сохранения данных', 'error');
    announce('Ошибка сохранения данных', 'assertive');
  }
}

function getCurrentProject() {
  return state.projects.find((project) => project.id === state.currentProjectId) || null;
}

function setNotice(text, type = "info") {
  uiNotice = { text, type };
}

function addActivity(project, text) {
  project.activity = project.activity || [];
  project.activity.unshift({ id: uid("act"), text, createdAt: new Date().toISOString() });
  project.activity = project.activity.slice(0, 80);
}

function commit(callback) {
  callback();
  saveState();
  render();
}

function withCurrentProject(callback) {
  const project = getCurrentProject();
  if (!project) return;
  commit(() => callback(project));
}

const projectSelector = document.getElementById("projectSelector");
const createProjectQuickBtn = document.getElementById("createProjectQuick");
const quickStats = document.getElementById("quickStats");
const moduleView = document.getElementById("moduleView");
const navButtons = [...document.querySelectorAll(".module-btn")];

projectSelector.addEventListener("change", () => {
  state.currentProjectId = projectSelector.value;
  saveState();
  render();
});

createProjectQuickBtn.addEventListener("click", () => {
  const start = toISODate(7);
  const end = toISODate(9);
  const ownerId = uid("member");
  const projectId = uid("project");

  commit(() => {
    const newProject = {
      id: projectId,
      title: `Новый поход ${state.projects.length + 1}`,
      startDate: start,
      endDate: end,
      type: "hiking",
      season: "summer",
      bodyType: "medium",
      inviteLink: `https://turist-pro.example/invite/${projectId}`,
      participants: [{ id: ownerId, name: "Вы", role: "owner" }],
      chat: [],
      gearItems: [],
      mealEntries: [],
      diary: [],
      activity: [{ id: uid("act"), text: "Проект создан", createdAt: new Date().toISOString() }],
    };
    state.projects.unshift(newProject);
    state.currentProjectId = newProject.id;
    state.activeModule = "projects";
    setNotice("Создан новый проект", "info");
  });
});

for (const button of navButtons) {
  button.addEventListener("click", () => {
    state.activeModule = button.dataset.module;
    saveState();
    render();
  });
}

function renderProjectSelector() {
  const options = state.projects
    .map((project) => `<option value="${project.id}" ${project.id === state.currentProjectId ? "selected" : ""}>${escapeHTML(project.title)}</option>`)
    .join("");
  projectSelector.innerHTML = options;
}

function collectMealRows(project) {
  const participantCount = getProjectParticipantCount(project);
  const rows = [];
  for (const entry of project.mealEntries || []) {
    const nutrition = calcEntryNutrition(entry, participantCount);
    for (const product of nutrition.products) {
      rows.push({ entryId: entry.id, ...product });
    }
  }
  return rows;
}

function getTotals(project) {
  const participantCount = getProjectParticipantCount(project);
  const meals = project.mealEntries || [];
  let grams = 0;
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  for (const entry of meals) {
    const nutrition = calcEntryNutrition(entry, participantCount);
    grams += nutrition.grams;
    calories += nutrition.calories;
    protein += nutrition.protein;
    fat += nutrition.fat;
    carbs += nutrition.carbs;
  }
  return { grams, calories, protein, fat, carbs };
}

function getFoodWeightByDay(project) {
  const dayCount = calculateDays(project);
  const weights = Array.from({ length: dayCount }, (_, i) => ({ day: i + 1, kg: 0 }));
  const participantCount = getProjectParticipantCount(project);
  for (const entry of project.mealEntries || []) {
    const nutrition = calcEntryNutrition(entry, participantCount);
    const dayObj = weights.find((x) => x.day === Number(entry.day));
    if (dayObj) dayObj.kg += nutrition.grams / 1000;
  }
  return weights;
}

function getQuickStats(project) {
  if (!project) {
    return [
      { label: "Проекты", value: "0" },
      { label: "Участники", value: "0" },
      { label: "Снаряжение", value: "0 кг" },
      { label: "Калории", value: "0 ккал" },
    ];
  }
  const gearWeight = (project.gearItems || []).reduce((acc, item) => acc + Number(item.weightKg || 0), 0);
  const totals = getTotals(project);
  return [
    { label: "Проекты", value: String(state.projects.length) },
    { label: "Участники", value: String(project.participants.length) },
    { label: "Снаряжение", value: `${gearWeight.toFixed(1)} кг` },
    { label: "Калории", value: `${Math.round(totals.calories)} ккал` },
  ];
}

function renderQuickStats() {
  const stats = getQuickStats(getCurrentProject());
  quickStats.innerHTML = stats
    .map(
      (item) => `
      <article class="stat-card">
        <span class="label">${escapeHTML(item.label)}</span>
        <span class="value">${escapeHTML(item.value)}</span>
      </article>
    `
    )
    .join("");
}

function renderEmptyState() {
  const tpl = document.getElementById("emptyStateTpl");
  moduleView.innerHTML = tpl.innerHTML;
}

function renderNotice() {
  if (!uiNotice) return "";
  const cls = uiNotice.type === "error" ? "badge alert" : uiNotice.type === "warn" ? "badge warn" : "badge";
  return `<div class="row"><span class="${cls}">${escapeHTML(uiNotice.text)}</span></div>`;
}

function renderProjectsModule(project) {
  if (!project) {
    renderEmptyState();
    return;
  }

  const projectRows = state.projects
    .map(
      (item) => `
      <div class="list-item">
        <div class="row" style="justify-content: space-between;">
          <strong>${escapeHTML(item.title)}</strong>
          <span class="badge">${typeLabel[item.type] || "-"}</span>
        </div>
        <div class="meta">${formatDate(item.startDate)} - ${formatDate(item.endDate)}</div>
        <div class="row">
          <button type="button" class="btn btn-secondary switch-project" data-project-id="${item.id}">Открыть</button>
          ${state.projects.length > 1 ? `<button type="button" class="btn btn-danger delete-project" data-project-id="${item.id}">Удалить</button>` : ""}
        </div>
      </div>
    `
    )
    .join("");

  const participantRows = (project.participants || [])
    .map(
      (person) => `
      <div class="list-item">
        <div class="row" style="justify-content: space-between;">
          <strong>${escapeHTML(person.name)}</strong>
          <span class="badge">${ROLES[person.role]}</span>
        </div>
        ${person.role !== "owner" ? `<button class="btn btn-danger remove-participant" data-member-id="${person.id}" type="button">Убрать</button>` : ""}
      </div>
    `
    )
    .join("");

  const chatRows = (project.chat || [])
    .slice()
    .reverse()
    .map(
      (msg) => `
      <div class="chat-item">
        <div>${escapeHTML(msg.message)}</div>
        <div class="chat-meta">${escapeHTML(msg.author)} · ${formatDateTime(msg.createdAt)}</div>
      </div>
    `
    )
    .join("");

  const shareText = encodeURIComponent(`Присоединяйтесь к походу: ${project.title}`);
  const shareLink = encodeURIComponent(project.inviteLink);

  moduleView.innerHTML = `
    <div class="panel-grid cols-2">
      <section class="card stack">
        <h3>Проект похода</h3>
        ${renderNotice()}
        <form id="projectSettingsForm" class="stack">
          <div class="row">
            <label class="field"><span>Название</span><input name="title" value="${escapeHTML(project.title)}" required /></label>
            <label class="field"><span>Тип</span>
              <select name="type">
                <option value="hiking" ${project.type === "hiking" ? "selected" : ""}>Пеший</option>
                <option value="ski" ${project.type === "ski" ? "selected" : ""}>Лыжный</option>
                <option value="water" ${project.type === "water" ? "selected" : ""}>Водный</option>
              </select>
            </label>
          </div>
          <div class="row">
            <label class="field"><span>Дата начала</span><input type="date" name="startDate" value="${project.startDate}" required /></label>
            <label class="field"><span>Дата конца</span><input type="date" name="endDate" value="${project.endDate}" required /></label>
            <label class="field"><span>Сезон</span>
              <select name="season">
                <option value="spring" ${project.season === "spring" ? "selected" : ""}>Весна</option>
                <option value="summer" ${project.season === "summer" ? "selected" : ""}>Лето</option>
                <option value="autumn" ${project.season === "autumn" ? "selected" : ""}>Осень</option>
                <option value="winter" ${project.season === "winter" ? "selected" : ""}>Зима</option>
              </select>
            </label>
          </div>
          <button class="btn btn-primary" type="submit">Сохранить параметры</button>
        </form>

        <h4>Создать еще проект</h4>
        <form id="newProjectForm" class="row">
          <label class="field"><span>Название</span><input name="title" placeholder="Например, Алтай 2026" required /></label>
          <label class="field"><span>Начало</span><input name="startDate" type="date" value="${toISODate(14)}" required /></label>
          <label class="field"><span>Конец</span><input name="endDate" type="date" value="${toISODate(17)}" required /></label>
          <button class="btn btn-accent" type="submit">Создать</button>
        </form>
      </section>

      <section class="card stack">
        <h3>Участники и приглашения</h3>
        <form id="addParticipantForm" class="row">
          <label class="field"><span>Имя</span><input name="name" placeholder="Имя участника" required /></label>
          <label class="field"><span>Роль</span>
            <select name="role">
              <option value="editor">Редактор</option>
              <option value="viewer">Наблюдатель</option>
            </select>
          </label>
          <button class="btn btn-primary" type="submit">Добавить</button>
        </form>
        <div class="list">${participantRows || '<div class="list-item">Участников пока нет</div>'}</div>
        <label class="field"><span>Ссылка-приглашение</span><input id="inviteLinkInput" readonly value="${escapeHTML(project.inviteLink)}" /></label>
        <div class="row">
          <button class="btn btn-secondary" id="copyInviteBtn" type="button">Скопировать ссылку</button>
          <a class="btn btn-secondary" href="https://t.me/share/url?url=${shareLink}&text=${shareText}" target="_blank" rel="noopener noreferrer">Поделиться в Telegram</a>
          <a class="btn btn-secondary" href="https://wa.me/?text=${shareText}%20${shareLink}" target="_blank" rel="noopener noreferrer">Поделиться в WhatsApp</a>
        </div>
      </section>

      <section class="card stack">
        <h3>Общий чат проекта</h3>
        <div class="chat-box">${chatRows || '<div class="chat-item">Сообщений пока нет</div>'}</div>
        <form id="chatForm" class="row">
          <label class="field"><span>Автор</span>
            <select name="author">
              ${project.participants.map((p) => `<option value="${escapeHTML(p.name)}">${escapeHTML(p.name)}</option>`).join("")}
            </select>
          </label>
          <label class="field"><span>Сообщение</span><input name="message" placeholder="Введите сообщение" required /></label>
          <button class="btn btn-primary" type="submit">Отправить</button>
        </form>
      </section>

      <section class="card stack">
        <h3>Все проекты</h3>
        <div class="list">${projectRows}</div>
      </section>
    </div>
  `;

  bindProjectsModule();
}

function renderGearModule(project) {
  if (!project) {
    renderEmptyState();
    return;
  }

  const participantOptions = project.participants.map((person) => `<option value="${person.id}">${escapeHTML(person.name)}</option>`).join("");
  const categoryHints = BASE_GEAR_LIBRARY.map((item) => `<div class="list-item"><strong>${escapeHTML(item.name)}</strong><div class="meta">${escapeHTML(item.category)} · ${escapeHTML(item.hint)}</div></div>`).join("");

  const rows = (project.gearItems || [])
    .map((item) => {
      const responsibleOptions = project.participants
        .map((person) => `<option value="${person.id}" ${item.responsibleId === person.id ? "selected" : ""}>${escapeHTML(person.name)}</option>`)
        .join("");

      return `
      <tr>
        <td>${escapeHTML(item.name)}</td>
        <td>${escapeHTML(item.category)}</td>
        <td><input class="gear-weight" data-id="${item.id}" type="number" min="0" step="0.05" value="${Number(item.weightKg || 0).toFixed(2)}" /></td>
        <td>
          <select class="gear-responsible" data-id="${item.id}">
            ${responsibleOptions}
          </select>
        </td>
        <td><input class="gear-packed" data-id="${item.id}" type="checkbox" ${item.packed ? "checked" : ""} /></td>
        <td><button class="btn btn-danger gear-delete" data-id="${item.id}" type="button">Удалить</button></td>
      </tr>
    `;
    })
    .join("");

  moduleView.innerHTML = `
    <div class="panel-grid cols-2">
      <section class="card stack">
        <h3>Интеллектуальный сборщик снаряжения</h3>
        ${renderNotice()}
        <div class="row">
          <button class="btn btn-primary" id="autofillGearBtn" type="button">Подобрать базовый список</button>
        </div>
        <form id="gearForm" class="stack">
          <div class="row">
            <label class="field"><span>Предмет</span><input name="name" placeholder="Например, Фонарь" required /></label>
            <label class="field"><span>Категория</span><input name="category" placeholder="Свет" required /></label>
          </div>
          <div class="row">
            <label class="field"><span>Вес, кг</span><input name="weightKg" type="number" min="0" step="0.05" value="0.3" required /></label>
            <label class="field"><span>Ответственный</span>
              <select name="responsibleId">${participantOptions}</select>
            </label>
          </div>
          <label class="field"><span>Подсказка</span><input name="hint" placeholder="Что проверить перед выходом" /></label>
          <button class="btn btn-accent" type="submit">Добавить в список</button>
        </form>
      </section>

      <section class="card stack">
        <h3>База подсказок и категорий</h3>
        <div class="list">${categoryHints}</div>
      </section>

      <section class="card stack" style="grid-column: 1 / -1;">
        <h3>Командное распределение без дублей</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Предмет</th>
                <th>Категория</th>
                <th>Вес (кг)</th>
                <th>Ответственный</th>
                <th>Упаковано</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="6">Список пуст</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;

  bindGearModule();
}

function renderMealsModule(project) {
  if (!project) {
    renderEmptyState();
    return;
  }

  const dayCount = calculateDays(project);
  const allTemplates = [
    ...COMMUNITY_TEMPLATES,
    ...(state.userTemplates || []).map((tpl) => ({ ...tpl, source: "user" })),
  ];

  const participantCount = getProjectParticipantCount(project);

  const mealRows = (project.mealEntries || [])
    .map((entry) => {
      const nutrition = calcEntryNutrition(entry, participantCount);
      return `
      <tr>
        <td>${entry.day}</td>
        <td>${escapeHTML(entry.mealType)}</td>
        <td>${escapeHTML(nutrition.dishName)}</td>
        <td>${Number(entry.servings || 1).toFixed(1)}</td>
        <td>${Math.round(nutrition.grams)} г</td>
        <td>${Math.round(nutrition.calories)} ккал</td>
        <td><input class="meal-packed" data-id="${entry.id}" type="checkbox" ${entry.packed ? "checked" : ""} /></td>
        <td><button class="btn btn-danger meal-delete" data-id="${entry.id}" type="button">Удалить</button></td>
      </tr>
    `;
    })
    .join("");

  const productRows = collectMealRows(project)
    .map(
      (row) => `
      <tr>
        <td>${row.day}</td>
        <td>${escapeHTML(row.mealType)}</td>
        <td>${escapeHTML(row.dishName)}</td>
        <td>${escapeHTML(row.name)}</td>
        <td>${Math.round(row.grams)} г</td>
        <td>${Math.round(row.kcalPer100)}</td>
        <td>${Math.round(row.calories)}</td>
        <td>${row.protein.toFixed(1)} / ${row.fat.toFixed(1)} / ${row.carbs.toFixed(1)}</td>
      </tr>
    `
    )
    .join("");

  const totals = getTotals(project);

  moduleView.innerHTML = `
    <div class="panel-grid cols-2">
      <section class="card stack">
        <h3>Планировщик питания</h3>
        ${renderNotice()}
        <form id="addMealForm" class="stack">
          <div class="row">
            <label class="field"><span>День</span>
              <select name="day">
                ${Array.from({ length: dayCount }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("")}
              </select>
            </label>
            <label class="field"><span>Прием пищи</span>
              <select name="mealType">${MEAL_TYPES.map((type) => `<option value="${type}">${type}</option>`).join("")}</select>
            </label>
            <label class="field"><span>Блюдо</span>
              <select name="dishId">${RECIPE_LIBRARY.map((dish) => `<option value="${dish.id}">${escapeHTML(dish.name)}</option>`).join("")}</select>
            </label>
          </div>
          <div class="row">
            <label class="field"><span>Коэф. порции</span><input name="servings" type="number" min="0.5" step="0.1" value="1" required /></label>
            <button class="btn btn-primary" type="submit">Добавить в раскладку</button>
            <button class="btn btn-danger" id="clearMealPlanBtn" type="button">Очистить раскладку</button>
          </div>
        </form>

        <div class="row">
          <span class="badge">Итого: ${Math.round(totals.grams)} г</span>
          <span class="badge">${Math.round(totals.calories)} ккал</span>
          <span class="badge">БЖУ: ${totals.protein.toFixed(1)} / ${totals.fat.toFixed(1)} / ${totals.carbs.toFixed(1)}</span>
        </div>
      </section>

      <section class="card stack">
        <h3>Шаблоны раскладки</h3>
        <div class="row">
          <label class="field"><span>Название шаблона</span><input id="templateNameInput" placeholder="Например, 3 дня лето" /></label>
          <button class="btn btn-accent" id="saveTemplateBtn" type="button">Сохранить шаблон</button>
        </div>
        <div class="row">
          <label class="field"><span>Выбрать шаблон</span>
            <select id="templateSelect">
              <option value="">Выберите шаблон</option>
              ${allTemplates.map((tpl) => `<option value="${tpl.id}">${escapeHTML(tpl.name)} ${tpl.source === "community" ? "(эксперт)" : "(мой)"}</option>`).join("")}
            </select>
          </label>
          <button class="btn btn-primary" id="loadTemplateBtn" type="button">Загрузить</button>
        </div>
        <p class="meta">Сохраняется формат: дни, сезон, тип и список блюд по приемам пищи.</p>
      </section>

      <section class="card stack" style="grid-column: 1 / -1;">
        <h3>Интеллектуальная таблица раскладки</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>День</th>
                <th>Прием</th>
                <th>Блюдо</th>
                <th>Порция</th>
                <th>Граммовка (группа)</th>
                <th>Калории</th>
                <th>Подготовлено</th>
                <th></th>
              </tr>
            </thead>
            <tbody>${mealRows || '<tr><td colspan="8">План питания пуст</td></tr>'}</tbody>
          </table>
        </div>
      </section>

      <section class="card stack" style="grid-column: 1 / -1;">
        <h3>Детальный расчет по продуктам</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>День</th>
                <th>Прием</th>
                <th>Блюдо</th>
                <th>Продукт</th>
                <th>Грамм</th>
                <th>ккал/100г</th>
                <th>ккал итого</th>
                <th>Б/Ж/У</th>
              </tr>
            </thead>
            <tbody>${productRows || '<tr><td colspan="8">Нет данных</td></tr>'}</tbody>
          </table>
        </div>
      </section>
    </div>
  `;

  bindMealsModule();
}

function drawPie(canvas, dataPairs) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  const total = dataPairs.reduce((sum, item) => sum + item.value, 0);
  if (!total) {
    ctx.fillStyle = "#5e6e65";
    ctx.font = "14px IBM Plex Sans";
    ctx.fillText("Недостаточно данных", 16, 26);
    return;
  }

  const colors = ["#2f6f4e", "#d07a2d", "#6a9f7a", "#4c8061", "#e1a766", "#7aaea2"];
  const cx = 95;
  const cy = height / 2;
  const radius = Math.min(70, height / 2 - 8);
  let start = -Math.PI / 2;

  dataPairs.forEach((item, index) => {
    const angle = (item.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    start += angle;
  });

  let y = 20;
  dataPairs.forEach((item, index) => {
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(190, y - 9, 12, 12);
    ctx.fillStyle = "#1d2b24";
    ctx.font = "12px IBM Plex Sans";
    ctx.fillText(`${item.label}: ${item.value.toFixed(1)} кг`, 208, y);
    y += 22;
  });
}

function drawLineChart(canvas, points) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  if (!points.length) {
    ctx.fillStyle = "#5e6e65";
    ctx.font = "14px IBM Plex Sans";
    ctx.fillText("Нет данных по дням", 16, 26);
    return;
  }

  const max = Math.max(...points.map((p) => p.value), 1);
  const left = 32;
  const right = width - 14;
  const top = 14;
  const bottom = height - 28;

  ctx.strokeStyle = "#bfd4c7";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = top + ((bottom - top) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#2f6f4e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = left + (index / Math.max(points.length - 1, 1)) * (right - left);
    const y = bottom - (point.value / max) * (bottom - top);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  points.forEach((point, index) => {
    const x = left + (index / Math.max(points.length - 1, 1)) * (right - left);
    const y = bottom - (point.value / max) * (bottom - top);
    ctx.fillStyle = "#d07a2d";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1d2b24";
    ctx.font = "11px IBM Plex Sans";
    ctx.fillText(`Д${point.day}`, x - 10, height - 8);
  });
}

function renderWeightModule(project) {
  if (!project) {
    renderEmptyState();
    return;
  }

  const gearWeight = (project.gearItems || []).reduce((sum, item) => sum + Number(item.weightKg || 0), 0);
  const foodByDay = getFoodWeightByDay(project);
  const dailyWeights = foodByDay.map((entry) => ({ day: entry.day, value: gearWeight + entry.kg }));
  const recommendedLimit = BODY_LIMITS[project.bodyType || "medium"];
  const maxCarry = dailyWeights.length ? Math.max(...dailyWeights.map((item) => item.value)) : gearWeight;
  const isOverweight = maxCarry > recommendedLimit;

  const gearByCategoryMap = new Map();
  for (const item of project.gearItems || []) {
    const prev = gearByCategoryMap.get(item.category) || 0;
    gearByCategoryMap.set(item.category, prev + Number(item.weightKg || 0));
  }
  const gearByCategory = [...gearByCategoryMap.entries()].map(([label, value]) => ({ label, value }));
  const foodData = foodByDay.map((item) => ({ label: `День ${item.day}`, value: item.kg }));

  const heavyItems = [...(project.gearItems || [])]
    .sort((a, b) => Number(b.weightKg || 0) - Number(a.weightKg || 0))
    .slice(0, 3)
    .map((item) => `${item.name} (${Number(item.weightKg || 0).toFixed(1)} кг)`)
    .join(", ");

  const optimizeTip = heavyItems.includes("Спальник")
    ? "Рассмотрите более легкий спальник-одеяло или компрессионный мешок."
    : "Проверьте тяжелые позиции и перераспределите груз между участниками.";

  moduleView.innerHTML = `
    <div class="panel-grid cols-2">
      <section class="card stack">
        <h3>Контроль веса и балансировка</h3>
        ${renderNotice()}
        <div class="row">
          <label class="field"><span>Телосложение</span>
            <select id="bodyTypeSelect">
              <option value="light" ${project.bodyType === "light" ? "selected" : ""}>Легкое</option>
              <option value="medium" ${project.bodyType === "medium" ? "selected" : ""}>Среднее</option>
              <option value="strong" ${project.bodyType === "strong" ? "selected" : ""}>Крепкое</option>
            </select>
          </label>
          <span class="badge">Рекомендованный предел: ${recommendedLimit} кг</span>
          <span class="badge ${isOverweight ? "alert" : ""}">Пик нагрузки: ${maxCarry.toFixed(1)} кг</span>
        </div>
        <div class="warning-box ${isOverweight ? "alert" : ""}">
          ${isOverweight
      ? `<strong>Внимание: вес рюкзака (${maxCarry.toFixed(1)} кг) выше нормы.</strong>`
      : `<strong>Нагрузка в пределах нормы.</strong>`}
          <span>Самые тяжелые вещи: ${escapeHTML(heavyItems || "нет данных")}</span>
          <span>${escapeHTML(optimizeTip)}</span>
        </div>
      </section>

      <section class="card stack canvas-card">
        <h3>График веса по дням</h3>
        <div class="chart-wrap"><canvas id="weightLineChart"></canvas></div>
      </section>

      <section class="card stack canvas-card">
        <h3>Диаграмма снаряжения</h3>
        <div class="chart-wrap"><canvas id="gearPieChart"></canvas></div>
      </section>

      <section class="card stack canvas-card">
        <h3>Диаграмма еды</h3>
        <div class="chart-wrap"><canvas id="foodPieChart"></canvas></div>
      </section>
    </div>
  `;

  const bodyTypeSelect = document.getElementById("bodyTypeSelect");
  if (bodyTypeSelect) {
    bodyTypeSelect.addEventListener("change", () => {
      withCurrentProject((current) => {
        current.bodyType = bodyTypeSelect.value;
        addActivity(current, `Обновлено телосложение: ${bodyLabel[current.bodyType]}`);
      });
    });
  }

  drawPie(document.getElementById("gearPieChart"), gearByCategory);
  drawPie(document.getElementById("foodPieChart"), foodData);
  drawLineChart(document.getElementById("weightLineChart"), dailyWeights);
}

function buildChecklist(project) {
  const gearChecklist = (project.gearItems || []).map((item) => ({
    kind: "gear",
    id: item.id,
    done: !!item.packed,
    title: item.name,
    owner: project.participants.find((p) => p.id === item.responsibleId)?.name || "Не назначен",
  }));

  const mealChecklist = (project.mealEntries || []).map((entry) => ({
    kind: "meal",
    id: entry.id,
    done: !!entry.packed,
    title: `День ${entry.day} · ${entry.mealType} · ${getDish(entry.dishId)?.name || "Блюдо"}`,
    owner: "Кухня",
  }));

  return [...gearChecklist, ...mealChecklist];
}

function renderChecklistModule(project) {
  if (!project) {
    renderEmptyState();
    return;
  }

  const checklist = buildChecklist(project);
  const doneCount = checklist.filter((item) => item.done).length;

  const checkRows = checklist
    .map(
      (item) => `
      <label class="check-row ${item.done ? "done" : ""}">
        <input
          type="checkbox"
          class="check-toggle"
          data-kind="${item.kind}"
          data-id="${item.id}"
          ${item.done ? "checked" : ""}
        />
        <span>${escapeHTML(item.title)}<br/><small class="meta">Ответственный: ${escapeHTML(item.owner)}</small></span>
        <span class="badge">${item.kind === "gear" ? "Снаряжение" : "Еда"}</span>
      </label>
    `
    )
    .join("");

  const feedRows = (project.activity || [])
    .slice(0, 16)
    .map((item) => `<div class="feed-item">${escapeHTML(item.text)} · ${formatDateTime(item.createdAt)}</div>`)
    .join("");

  moduleView.innerHTML = `
    <div class="panel-grid cols-2">
      <section class="card stack">
        <h3>Интерактивный чек-лист</h3>
        ${renderNotice()}
        <div class="row">
          <span class="badge">Готово: ${doneCount} / ${checklist.length}</span>
          <button id="requestNotifyBtn" class="btn btn-secondary" type="button">Разрешить уведомления</button>
          <button id="sendReminderBtn" class="btn btn-primary" type="button">Тест напоминания</button>
        </div>
        <div class="stack">${checkRows || '<div class="list-item">Пока нечего отмечать</div>'}</div>
      </section>

      <section class="card stack">
        <h3>Лента статусов</h3>
        <div class="feed">${feedRows || '<div class="feed-item">Событий пока нет</div>'}</div>
      </section>
    </div>
  `;

  bindChecklistModule();
  scheduleDepartureReminder(project);
}

function renderToolsModule(project) {
  if (!project) {
    renderEmptyState();
    return;
  }

  const diaryRows = (project.diary || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(
      (entry) => `
      <article class="timeline-item">
        <div class="row" style="justify-content: space-between;">
          <strong>${formatDateTime(entry.createdAt)}</strong>
          <button class="btn btn-danger diary-delete" data-id="${entry.id}" type="button">Удалить</button>
        </div>
        <p>${escapeHTML(entry.text)}</p>
        <p class="meta">Геотег: ${escapeHTML(entry.geotag || "не указан")}</p>
        ${entry.photo ? `<img alt="Фото из дневника" src="${entry.photo}" />` : ""}
      </article>
    `
    )
    .join("");

  const water = state.tools.waterCalc;

  moduleView.innerHTML = `
    <div class="panel-grid cols-2">
      <section class="card stack">
        <h3>Офлайн-справочник первой помощи</h3>
        <div class="list">
          ${FIRST_AID_GUIDE.map((item) => `<div class="list-item"><strong>${escapeHTML(item.title)}</strong><div class="meta">${escapeHTML(item.steps)}</div></div>`).join("")}
        </div>
      </section>

      <section class="card stack">
        <h3>Калькулятор расхода воды</h3>
        <form id="waterForm" class="stack">
          <div class="row">
            <label class="field"><span>Погода</span>
              <select name="weather">
                <option value="cold">Холодно</option>
                <option value="mild" selected>Умеренно</option>
                <option value="hot">Жарко</option>
              </select>
            </label>
            <label class="field"><span>Активность</span>
              <select name="activity">
                <option value="low">Низкая</option>
                <option value="medium" selected>Средняя</option>
                <option value="high">Высокая</option>
              </select>
            </label>
          </div>
          <div class="row">
            <label class="field"><span>Часы в движении</span><input name="hours" type="number" min="1" value="6" /></label>
            <label class="field"><span>Количество людей</span><input name="people" type="number" min="1" value="${project.participants.length}" /></label>
          </div>
          <button class="btn btn-primary" type="submit">Рассчитать воду</button>
        </form>
        ${water
      ? `<div class="warning-box"><strong>${water.totalLiters.toFixed(1)} л на группу</strong><span>${water.perPerson.toFixed(1)} л на человека</span></div>`
      : `<p class="meta">Введите параметры для расчета.</p>`
    }
      </section>

      <section class="card stack" style="grid-column: 1 / -1;">
        <h3>Дневник похода с геотегами и фото</h3>
        <form id="diaryForm" class="stack">
          <div class="row">
            <label class="field"><span>Запись</span><textarea name="text" placeholder="Что произошло на маршруте" required></textarea></label>
          </div>
          <div class="row">
            <label class="field"><span>Геотег</span><input id="geotagInput" name="geotag" placeholder="48.52, 24.56" /></label>
            <button class="btn btn-secondary" id="geoBtn" type="button">Определить геопозицию</button>
            <label class="field"><span>Фото</span><input id="photoInput" type="file" accept="image/*" /></label>
          </div>
          <img id="photoPreview" alt="Предпросмотр" style="display:${pendingDiaryPhoto ? "block" : "none"};max-width:220px;border-radius:10px;border:1px solid #d6e2da;" src="${pendingDiaryPhoto}" />
          <button class="btn btn-accent" type="submit">Добавить в хронологию</button>
        </form>

        <div class="timeline">${diaryRows || '<div class="list-item">Записей пока нет</div>'}</div>
      </section>
    </div>
  `;

  bindToolsModule();
}

function render() {
  const project = getCurrentProject();

  renderProjectSelector();
  renderQuickStats();

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.module === state.activeModule);
  });

  if (!project) {
    renderEmptyState();
    return;
  }

  switch (state.activeModule) {
    case "projects":
      renderProjectsModule(project);
      break;
    case "gear":
      renderGearModule(project);
      break;
    case "meals":
      renderMealsModule(project);
      break;
    case "weight":
      renderWeightModule(project);
      break;
    case "checklist":
      renderChecklistModule(project);
      break;
    case "tools":
      renderToolsModule(project);
      break;
    default:
      renderProjectsModule(project);
      break;
  }

  uiNotice = null;
}

function bindProjectsModule() {
  const settingsForm = document.getElementById("projectSettingsForm");
  if (settingsForm) {
    settingsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(settingsForm);
      withCurrentProject((project) => {
        project.title = String(formData.get("title") || "").trim() || project.title;
        project.startDate = String(formData.get("startDate") || project.startDate);
        project.endDate = String(formData.get("endDate") || project.endDate);
        project.type = String(formData.get("type") || project.type);
        project.season = String(formData.get("season") || project.season);
        addActivity(project, "Параметры проекта обновлены");
        setNotice("Параметры проекта сохранены", "info");
      });
    });
  }

  const newProjectForm = document.getElementById("newProjectForm");
  if (newProjectForm) {
    newProjectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(newProjectForm);
      const title = String(formData.get("title") || "").trim();
      const startDate = String(formData.get("startDate") || toISODate(7));
      const endDate = String(formData.get("endDate") || toISODate(9));
      if (!title) return;

      commit(() => {
        const ownerId = uid("member");
        const projectId = uid("project");
        const project = {
          id: projectId,
          title,
          startDate,
          endDate,
          type: "hiking",
          season: "summer",
          bodyType: "medium",
          inviteLink: `https://turist-pro.example/invite/${projectId}`,
          participants: [{ id: ownerId, name: "Вы", role: "owner" }],
          chat: [],
          gearItems: [],
          mealEntries: [],
          diary: [],
          activity: [{ id: uid("act"), text: "Проект создан", createdAt: new Date().toISOString() }],
        };
        state.projects.unshift(project);
        state.currentProjectId = project.id;
        setNotice("Проект создан", "info");
      });
    });
  }

  document.querySelectorAll(".switch-project").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentProjectId = button.dataset.projectId;
      saveState();
      render();
    });
  });

  document.querySelectorAll(".delete-project").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.projectId;
      commit(() => {
        state.projects = state.projects.filter((project) => project.id !== targetId);
        if (!state.projects.length) {
          const fallback = createDemoProject();
          state.projects.push(fallback);
        }
        if (!state.projects.some((project) => project.id === state.currentProjectId)) {
          state.currentProjectId = state.projects[0].id;
        }
        setNotice("Проект удален", "warn");
      });
    });
  });

  const addParticipantForm = document.getElementById("addParticipantForm");
  if (addParticipantForm) {
    addParticipantForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(addParticipantForm);
      const name = String(formData.get("name") || "").trim();
      const role = String(formData.get("role") || "editor");
      if (!name) return;
      withCurrentProject((project) => {
        project.participants.push({ id: uid("member"), name, role });
        addActivity(project, `Добавлен участник: ${name}`);
        setNotice("Участник добавлен", "info");
      });
    });
  }

  document.querySelectorAll(".remove-participant").forEach((button) => {
    button.addEventListener("click", () => {
      const memberId = button.dataset.memberId;
      withCurrentProject((project) => {
        const member = project.participants.find((participant) => participant.id === memberId);
        project.participants = project.participants.filter((participant) => participant.id !== memberId);
        for (const gearItem of project.gearItems) {
          if (gearItem.responsibleId === memberId) {
            gearItem.responsibleId = project.participants[0]?.id || "";
          }
        }
        addActivity(project, `Удален участник: ${member?.name || ""}`);
        setNotice("Участник удален", "warn");
      });
    });
  });

  const copyInviteBtn = document.getElementById("copyInviteBtn");
  if (copyInviteBtn) {
    copyInviteBtn.addEventListener("click", async () => {
      const input = document.getElementById("inviteLinkInput");
      const text = input?.value || "";
      try {
        await navigator.clipboard.writeText(text);
        setNotice("Ссылка скопирована", "info");
      } catch {
        setNotice("Не удалось скопировать ссылку", "error");
      }
      render();
    });
  }

  const chatForm = document.getElementById("chatForm");
  if (chatForm) {
    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(chatForm);
      const author = String(formData.get("author") || "Участник");
      const message = String(formData.get("message") || "").trim();
      if (!message) return;
      withCurrentProject((project) => {
        project.chat.push({ id: uid("msg"), author, message, createdAt: new Date().toISOString() });
        addActivity(project, `${author}: отправлено сообщение в чат`);
      });
    });
  }
}

function matchAutoGearItem(project, templateItem) {
  const typeMatch = templateItem.types.includes(project.type);
  const seasonMatch = templateItem.seasons.includes("all") || templateItem.seasons.includes(project.season);
  return typeMatch && seasonMatch;
}

function bindGearModule() {
  const autofillGearBtn = document.getElementById("autofillGearBtn");
  if (autofillGearBtn) {
    autofillGearBtn.addEventListener("click", () => {
      withCurrentProject((project) => {
        let added = 0;
        for (const item of BASE_GEAR_LIBRARY) {
          if (!matchAutoGearItem(project, item)) continue;
          const exists = (project.gearItems || []).some((gear) => normalizeName(gear.name) === normalizeName(item.name));
          if (exists) continue;
          project.gearItems.push({
            id: uid("gear"),
            name: item.name,
            category: item.category,
            weightKg: item.weightKg,
            responsibleId: project.participants[0]?.id || "",
            hint: item.hint,
            packed: false,
          });
          added += 1;
        }
        addActivity(project, `Автоподбор добавил ${added} предмет(ов)`);
        setNotice(added ? `Добавлено ${added} предмет(ов)` : "Дубли не добавлены", added ? "info" : "warn");
      });
    });
  }

  const gearForm = document.getElementById("gearForm");
  if (gearForm) {
    gearForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(gearForm);
      const name = String(formData.get("name") || "").trim();
      const category = String(formData.get("category") || "Прочее").trim();
      const weightKg = Number(formData.get("weightKg") || 0);
      const responsibleId = String(formData.get("responsibleId") || "");
      const hint = String(formData.get("hint") || "").trim();

      if (!name || weightKg < 0) return;

      withCurrentProject((project) => {
        const duplicate = project.gearItems.some((item) => normalizeName(item.name) === normalizeName(name));
        if (duplicate) {
          setNotice("Этот предмет уже есть в списке, дублирование предотвращено", "warn");
          return;
        }

        project.gearItems.push({
          id: uid("gear"),
          name,
          category,
          weightKg,
          responsibleId,
          hint,
          packed: false,
        });
        addActivity(project, `Добавлено снаряжение: ${name}`);
        setNotice("Предмет добавлен", "info");
      });
    });
  }

  document.querySelectorAll(".gear-delete").forEach((button) => {
    button.addEventListener("click", () => {
      withCurrentProject((project) => {
        const id = button.dataset.id;
        const item = project.gearItems.find((x) => x.id === id);
        project.gearItems = project.gearItems.filter((x) => x.id !== id);
        addActivity(project, `Удалено снаряжение: ${item?.name || ""}`);
      });
    });
  });

  document.querySelectorAll(".gear-packed").forEach((input) => {
    input.addEventListener("change", () => {
      withCurrentProject((project) => {
        const id = input.dataset.id;
        const item = project.gearItems.find((x) => x.id === id);
        if (!item) return;
        item.packed = input.checked;
        addActivity(project, `${item.name}: ${item.packed ? "упаковано" : "снято с отметки"}`);
      });
    });
  });

  document.querySelectorAll(".gear-responsible").forEach((select) => {
    select.addEventListener("change", () => {
      withCurrentProject((project) => {
        const id = select.dataset.id;
        const item = project.gearItems.find((x) => x.id === id);
        if (!item) return;
        item.responsibleId = select.value;
        const person = project.participants.find((x) => x.id === select.value);
        addActivity(project, `${item.name}: назначен ${person?.name || "участник"}`);
      });
    });
  });

  document.querySelectorAll(".gear-weight").forEach((input) => {
    input.addEventListener("change", () => {
      withCurrentProject((project) => {
        const id = input.dataset.id;
        const item = project.gearItems.find((x) => x.id === id);
        if (!item) return;
        const value = Number(input.value || 0);
        item.weightKg = value >= 0 ? value : item.weightKg;
      });
    });
  });
}

function bindMealsModule() {
  const addMealForm = document.getElementById("addMealForm");
  if (addMealForm) {
    addMealForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(addMealForm);
      const day = Number(formData.get("day") || 1);
      const mealType = String(formData.get("mealType") || "Завтрак");
      const dishId = String(formData.get("dishId") || "");
      const servings = Number(formData.get("servings") || 1);

      withCurrentProject((project) => {
        project.mealEntries.push({
          id: uid("meal"),
          day,
          mealType,
          dishId,
          servings: servings > 0 ? servings : 1,
          packed: false,
        });
        addActivity(project, `Добавлено блюдо: ${getDish(dishId)?.name || "блюдо"}`);
      });
    });
  }

  const clearMealPlanBtn = document.getElementById("clearMealPlanBtn");
  if (clearMealPlanBtn) {
    clearMealPlanBtn.addEventListener("click", () => {
      withCurrentProject((project) => {
        project.mealEntries = [];
        addActivity(project, "Раскладка питания очищена");
      });
    });
  }

  document.querySelectorAll(".meal-delete").forEach((button) => {
    button.addEventListener("click", () => {
      withCurrentProject((project) => {
        const id = button.dataset.id;
        project.mealEntries = project.mealEntries.filter((entry) => entry.id !== id);
      });
    });
  });

  document.querySelectorAll(".meal-packed").forEach((input) => {
    input.addEventListener("change", () => {
      withCurrentProject((project) => {
        const item = project.mealEntries.find((entry) => entry.id === input.dataset.id);
        if (!item) return;
        item.packed = input.checked;
        addActivity(project, `Еда: ${item.day} день ${item.mealType} отмечено как ${item.packed ? "подготовлено" : "не подготовлено"}`);
      });
    });
  });

  const saveTemplateBtn = document.getElementById("saveTemplateBtn");
  if (saveTemplateBtn) {
    saveTemplateBtn.addEventListener("click", () => {
      const nameInput = document.getElementById("templateNameInput");
      const name = String(nameInput?.value || "").trim();
      if (!name) {
        setNotice("Введите название шаблона", "warn");
        render();
        return;
      }

      withCurrentProject((project) => {
        const template = {
          id: uid("tpl_usr"),
          name,
          type: project.type,
          season: project.season,
          days: calculateDays(project),
          entries: (project.mealEntries || []).map((entry) => ({
            day: entry.day,
            mealType: entry.mealType,
            dishId: entry.dishId,
            servings: entry.servings,
          })),
        };
        state.userTemplates.unshift(template);
        setNotice("Шаблон сохранен", "info");
      });
    });
  }

  const loadTemplateBtn = document.getElementById("loadTemplateBtn");
  if (loadTemplateBtn) {
    loadTemplateBtn.addEventListener("click", () => {
      const templateSelect = document.getElementById("templateSelect");
      const templateId = templateSelect?.value;
      if (!templateId) {
        setNotice("Выберите шаблон", "warn");
        render();
        return;
      }

      const template =
        COMMUNITY_TEMPLATES.find((item) => item.id === templateId) ||
        (state.userTemplates || []).find((item) => item.id === templateId);

      if (!template) {
        setNotice("Шаблон не найден", "error");
        render();
        return;
      }

      withCurrentProject((project) => {
        const dayCount = calculateDays(project);
        project.mealEntries = template.entries
          .filter((entry) => Number(entry.day) <= dayCount)
          .map((entry) => ({
            id: uid("meal"),
            day: entry.day,
            mealType: entry.mealType,
            dishId: entry.dishId,
            servings: entry.servings,
            packed: false,
          }));
        addActivity(project, `Загружен шаблон питания: ${template.name}`);
        setNotice(`Шаблон "${template.name}" загружен`, "info");
      });
    });
  }
}

async function showNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  if (navigator.serviceWorker) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      await reg.showNotification(title, {
        body,
        icon: "./assets/icon-192.svg",
        badge: "./assets/icon-192.svg",
      });
      return;
    }
  }

  new Notification(title, { body });
}

function scheduleDepartureReminder(project) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  if (reminderTimers.has(project.id)) {
    clearTimeout(reminderTimers.get(project.id));
    reminderTimers.delete(project.id);
  }

  if (!project.startDate) return;
  const departure = new Date(project.startDate);
  const reminderTime = departure.getTime() - 2 * 24 * 60 * 60 * 1000;
  const delay = reminderTime - Date.now();

  if (delay <= 0 || delay > 30 * 24 * 60 * 60 * 1000) return;

  const timeoutId = setTimeout(() => {
    showNotification("До выхода 2 дня", `Проверьте, все ли собрано по проекту «${project.title}».`);
  }, delay);

  reminderTimers.set(project.id, timeoutId);
}

function bindChecklistModule() {
  document.querySelectorAll(".check-toggle").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      const kind = toggle.dataset.kind;
      const id = toggle.dataset.id;

      withCurrentProject((project) => {
        if (kind === "gear") {
          const item = project.gearItems.find((gearItem) => gearItem.id === id);
          if (!item) return;
          item.packed = toggle.checked;
          addActivity(project, `${item.name}: ${toggle.checked ? "упаковано" : "не упаковано"}`);
        }

        if (kind === "meal") {
          const entry = project.mealEntries.find((mealEntry) => mealEntry.id === id);
          if (!entry) return;
          entry.packed = toggle.checked;
          addActivity(project, `Еда день ${entry.day} (${entry.mealType}): ${toggle.checked ? "готово" : "не готово"}`);
        }
      });
    });
  });

  const requestNotifyBtn = document.getElementById("requestNotifyBtn");
  if (requestNotifyBtn) {
    requestNotifyBtn.addEventListener("click", async () => {
      if (!("Notification" in window)) {
        setNotice("Уведомления не поддерживаются в этом браузере", "error");
        render();
        return;
      }
      const result = await Notification.requestPermission();
      setNotice(result === "granted" ? "Уведомления включены" : "Разрешение не выдано", result === "granted" ? "info" : "warn");
      render();
    });
  }

  const sendReminderBtn = document.getElementById("sendReminderBtn");
  if (sendReminderBtn) {
    sendReminderBtn.addEventListener("click", async () => {
      const project = getCurrentProject();
      if (!project) return;
      await showNotification("Проверка чек-листа", `По проекту «${project.title}» есть незакрытые пункты.`);
      setNotice("Тестовое напоминание отправлено", "info");
      render();
    });
  }
}

function bindToolsModule() {
  const waterForm = document.getElementById("waterForm");
  if (waterForm) {
    waterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(waterForm);
      const weather = String(formData.get("weather") || "mild");
      const activity = String(formData.get("activity") || "medium");
      const hours = Number(formData.get("hours") || 6);
      const people = Number(formData.get("people") || 1);

      const weatherFactor = { cold: 1, mild: 1.2, hot: 1.5 }[weather] || 1.2;
      const activityFactor = { low: 0.8, medium: 1, high: 1.25 }[activity] || 1;

      const perPerson = Math.max(0.7, hours * 0.3 * weatherFactor * activityFactor);
      const totalLiters = perPerson * Math.max(1, people);

      commit(() => {
        state.tools.waterCalc = { perPerson, totalLiters };
      });
    });
  }

  const geoBtn = document.getElementById("geoBtn");
  if (geoBtn) {
    geoBtn.addEventListener("click", () => {
      const geotagInput = document.getElementById("geotagInput");
      if (!navigator.geolocation) {
        setNotice("Геолокация недоступна", "error");
        render();
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (geotagInput) {
            geotagInput.value = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
          }
        },
        () => {
          setNotice("Не удалось получить геопозицию", "warn");
          render();
        }
      );
    });
  }

  const photoInput = document.getElementById("photoInput");
  if (photoInput) {
    photoInput.addEventListener("change", () => {
      const file = photoInput.files?.[0];
      if (!file) {
        pendingDiaryPhoto = "";
        render();
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        pendingDiaryPhoto = String(reader.result || "");
        const preview = document.getElementById("photoPreview");
        if (preview) {
          preview.src = pendingDiaryPhoto;
          preview.style.display = "block";
        }
      };
      reader.readAsDataURL(file);
    });
  }

  const diaryForm = document.getElementById("diaryForm");
  if (diaryForm) {
    diaryForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(diaryForm);
      const text = String(formData.get("text") || "").trim();
      const geotag = String(formData.get("geotag") || "").trim();
      if (!text) return;

      withCurrentProject((project) => {
        project.diary.push({
          id: uid("entry"),
          text,
          geotag,
          photo: pendingDiaryPhoto,
          createdAt: new Date().toISOString(),
        });
        addActivity(project, "Добавлена запись в дневник");
        pendingDiaryPhoto = "";
      });
    });
  }

  document.querySelectorAll(".diary-delete").forEach((button) => {
    button.addEventListener("click", () => {
      withCurrentProject((project) => {
        project.diary = project.diary.filter((entry) => entry.id !== button.dataset.id);
        addActivity(project, "Удалена запись из дневника");
      });
    });
  });
}

async function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("./sw.js");
  } catch {
    // no-op
  }
}

// Initialize application with Telegram support
async function initApp() {
  const loadingScreen = document.getElementById('telegram-loading');
  const loadingText = loadingScreen?.querySelector('.loading-text');
  const loadingHint = loadingScreen?.querySelector('.loading-hint');

  try {
    // Step 1: Initialize Telegram
    if (loadingText) loadingText.textContent = 'Подключение к Telegram...';

    const telegramUser = initTelegramApp();
    const isTelegram = isTelegramEnvironment();

    // Step 2: Initialize Supabase
    if (loadingText) loadingText.textContent = 'Подключение к серверу...';
    const hasBackend = initSupabase();

    if (!isTelegram) {
      console.warn('Not running in Telegram. Using local mode.');
      if (loadingHint) loadingHint.textContent = 'Локальный режим';
    }

    // Step 3: Authenticate user
    if (isTelegram && telegramUser) {
      if (loadingText) loadingText.textContent = 'Авторизация...';

      try {
        const user = await authenticateUser(telegramUser);
        console.log('Authenticated:', user);
        announce(`Добро пожаловать, ${user.first_name || telegramUser.firstName}!`);
      } catch (error) {
        console.error('Auth error:', error);
        if (typeof showAlert === 'function') showAlert('Ошибка авторизации. Работаем в автономном режиме.');
      }
    }

    // Step 4: Load projects from backend or localStorage
    if (loadingText) loadingText.textContent = 'Загрузка данных...';

    let loadedProjects = [];

    if (hasBackend && isOnlineMode()) {
      try {
        loadedProjects = await fetchProjects();
        console.log(`Loaded ${loadedProjects.length} projects from backend`);
      } catch (error) {
        console.error('Load error:', error);
        const localState = loadState();
        loadedProjects = localState.projects || [];
      }
    } else {
      const localState = loadState();
      loadedProjects = localState.projects || [];
    }

    // Initialize state with loaded projects
    if (loadedProjects.length > 0) {
      state.projects = loadedProjects;
      state.currentProjectId = loadedProjects[0].id;
    }

    // Initialize accessibility features
    try {
      initKeyboardNavigation();
    } catch (e) {
      console.error('Accessibility init failed:', e);
    }

    // Hide loading screen
    if (loadingText) loadingText.textContent = 'Готово!';

    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => loadingScreen.remove(), 300);
      }
    }, 200);

    // Initial render
    render();

    // Announce app ready to screen readers
    setTimeout(() => {
      try {
        announce('Приложение Turist Pro Planner загружено и готово к использованию');
      } catch (e) {
        console.error('Announce failed:', e);
      }
    }, 500);

  } catch (error) {
    console.error('Init failed:', error);

    if (loadingText) loadingText.textContent = 'Ошибка';
    if (loadingHint) loadingHint.textContent = error.message;

    setTimeout(() => {
      if (typeof showAlert === 'function') showAlert(`Ошибка инициализации: ${error.message}`);

      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => loadingScreen.remove(), 300);
      }

      // Fallback render
      render();
    }, 1000);
  }
}

initServiceWorker();

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
