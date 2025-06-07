<template>
  <v-app :class="{ 'hide-cursor': mousemode }">
    <!-- 顶部标题栏 -->
    <v-app-bar v-if="showUI" density="compact" color="primary">
      <v-toolbar-title>
        <span class="ml-2">{{ $t("appTitle") }}</span>
      </v-toolbar-title>
    </v-app-bar>

    <!-- 主内容区 -->
    <v-main class="d-flex flex-column">
      <div class="d-flex flex-grow-1 justify-center align-center">
        <div class="objection-content">
          <v-img
            :src="'img/' + currentVoice + '.png'"
            :class="{ 'shake-animation': playing, 'objection-hide': !playing }"
            class="objection-image"
            contain
            draggable="false"
          />
        </div>
      </div>

      <!-- 控制面板 -->
      <v-sheet v-if="showUI" class="pa-4 control-panel" elevation="3">
        <v-row no-gutters>
          <!-- 演示视频和GitHub按钮 -->
          <v-col cols="12" class="mb-2">
            <div class="d-flex">
              <v-btn
                color="primary"
                variant="text"
                :href="$t('bilibiliLink')"
                target="_blank"
                prepend-icon="mdi-play-circle"
                class="mr-1"
              >
                {{ $t("demoVideo") }}
              </v-btn>

              <v-btn
                color="primary"
                variant="text"
                href="https://github.com/shoyu3/portable-objection-new"
                target="_blank"
                prepend-icon="mdi-github"
                >GitHub
              </v-btn>

              <span class="ml-1" style="height: 36px; line-height: 36px"
                >🛠️ Shoyu
              </span>
            </div>
          </v-col>

          <!-- 说明alert -->
          <v-col cols="12">
            <v-alert
              color="info"
              variant="tonal"
              border="start"
              density="compact"
              class="mb-0"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-information-outline"></v-icon>
              </template>
              <div v-html="$t('usageTips')"></div>
            </v-alert>

            <div v-if="isDesktop" class="mt-2">
              <v-btn
                :color="mousemode ? 'error' : 'primary'"
                @click="toggleMouseMode"
                block
              >
                {{ mousemode ? $t("stopMouseMode") : $t("startMouseMode") }}
              </v-btn>
              <div class="text-caption mt-1 text-center">
                {{ $t("keyboardShortcut") }}
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row dense>
          <v-col cols="12">
            <v-card variant="flat">
              <v-card-text class="d-flex align-center pt-0 pb-0">
                <span v-html="sensorData" class="sensor-data"></span>
                <v-btn
                  size="small"
                  variant="outlined"
                  class="ml-2"
                  @click="resetSensor"
                  >{{ $t("reset") }}</v-btn
                >
              </v-card-text>

              <v-card-actions class="action-container">
                <!-- 角色选择 -->
                <v-select
                  v-model="character"
                  :items="characterOptions"
                  :label="$t('character')"
                  density="compact"
                  variant="outlined"
                  class="mr-2"
                  hide-details="auto"
                  :disabled="playing"
                  style="width: 50%"
                ></v-select>

                <!-- 语音类型 -->
                <v-select
                  v-model="voiceType"
                  :items="filteredVoiceTypes"
                  :label="$t('voiceType')"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  :disabled="playing"
                  style="width: 50%"
                ></v-select>
              </v-card-actions>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card variant="flat">
              <v-card-title class="text-subtitle-1 pt-0">{{
                $t("sensitivity")
              }}</v-card-title>
              <v-card-text class="pb-0">
                <v-slider
                  v-model="sensitivity"
                  :min="0.2"
                  :max="80"
                  :step="0.2"
                  :thumb-size="24"
                  thumb-label
                  color="primary"
                  hide-details="auto"
                >
                  <template v-slot:thumb-label="{ modelValue }">
                    {{ modelValue.toFixed(1) }}
                  </template>
                </v-slider>
                <div class="sensitivity-info">
                  {{ $t("sensitivityInfo") }}: {{ sensitivityInfo }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 音效音量控制 -->
          <v-col cols="12">
            <v-card variant="flat">
              <v-card-title class="text-subtitle-1 pt-0">{{
                $t("volume")
              }}</v-card-title>
              <v-card-text class="pb-0">
                <v-slider
                  v-model="volume"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  :thumb-size="24"
                  thumb-label
                  color="primary"
                  hide-details="auto"
                >
                  <template v-slot:thumb-label="{ modelValue }">
                    {{ (modelValue * 100).toFixed(0) }}%
                  </template>
                </v-slider>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card variant="flat">
              <v-card-text class="pt-0 pb-0">
                <div class="d-flex align-center">
                  <v-icon
                    :color="cachedStatus ? 'success' : 'warning'"
                    class="mr-2"
                  >
                    {{
                      cachedStatus
                        ? "mdi-check-circle"
                        : "mdi-progress-question"
                    }}
                  </v-icon>
                  <span>{{ $t("testHint") }}</span>
                  <v-btn class="ml-2" color="primary" @click="playAudio">
                    {{ $t("test") }}
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    class="ml-2"
                    @click="showClearCacheDialog = true"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>

                <div class="mt-1">
                  <v-checkbox
                    color="primary"
                    v-model="autoPlayMusic"
                    :label="$t('autoPlayMusic')"
                    density="compact"
                    hide-details
                  ></v-checkbox>
                </div>

                <div class="mt-0">
                  <v-checkbox
                    color="primary"
                    v-model="vibrationEnabled"
                    :label="$t('vibration')"
                    density="compact"
                    hide-details
                  ></v-checkbox>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" class="mb-8">
            <v-card variant="flat">
              <v-card-text class="pt-0">
                <v-divider class="my-2"></v-divider>
                <!-- 语言切换 -->
                <div class="d-flex">
                  <v-menu location="bottom" max-width="120px">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        variant="text"
                        :prepend-icon="`mdi-translate`"
                        class="lang-btn"
                      >
                        {{ currentLanguageName }}
                      </v-btn>
                    </template>
                    <v-list density="comfortable" class="lang-menu">
                      <v-list-item
                        v-for="lang in availableLanguages"
                        :key="lang.code"
                        @click="changeLanguage(lang.code)"
                        :class="{ active: locale === lang.code }"
                      >
                        <v-list-item-title class="text-center">
                          {{ lang.name }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>

                  <v-btn
                    variant="text"
                    :prepend-icon="`mdi-${
                      dark ? 'weather-night' : 'weather-sunny'
                    }`"
                    @click="toggleTheme"
                    class="ml-2"
                  >
                    {{ dark ? $t("lightTheme") : $t("darkTheme") }}
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-sheet>

      <!-- 音乐播放器 -->
      <v-sheet elevation="0" class="music-player">
        <meting-js
          server="netease"
          type="playlist"
          id="9487616885"
          fixed="true"
          loop="one"
          order="list"
          @player-loaded="handlePlayerLoaded"
        ></meting-js>
      </v-sheet>

      <!-- 右下角浮动按钮 -->
      <v-btn
        fab
        fixed
        bottom
        right
        color="primary"
        @click="toggleUI"
        class="toggle-ui-btn"
        rounded="xl"
      >
        <v-icon>{{ showUI ? "mdi-eye-off" : "mdi-eye" }}</v-icon>
      </v-btn>

      <!-- 清空缓存确认对话框 -->
      <v-dialog v-model="showClearCacheDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h5">
            {{ $t("confirmClearCacheTitle") }}
          </v-card-title>
          <v-card-text>
            {{ $t("confirmClearCacheMessage") }}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="showClearCacheDialog = false">
              {{ $t("cancel") }}
            </v-btn>
            <v-btn color="error" @click="confirmClearCache">
              {{ $t("confirm") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useTheme } from "vuetify";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "@/stores/useSettingsStore";

const { locale } = useI18n();
const theme = useTheme();
const dark = ref(theme.global.name.value === "dark");
const settingsStore = useSettingsStore();
const isDesktop = !("ontouchstart" in window) || window.innerWidth > 768;

// 组件状态
const character = ref(settingsStore.character);
const voiceType = ref(settingsStore.voiceType);
const sensitivity = ref(settingsStore.sensitivity);
const volume = ref(settingsStore.volume || 0.5);
const autoPlayMusic = ref(settingsStore.autoPlayMusic);
const vibrationEnabled = ref(settingsStore.vibrationEnabled || true);
const playing = ref(false);
const showUI = ref(true);
const mousemode = ref(false);
const sensorStatus = ref(false);
const sensorValues = ref({ x: 0, y: 0, z: 0 });
const maxValues = ref({ x: 0, y: 0, z: 0 });
const showClearCacheDialog = ref(false);
const aplayer = ref(null);

// 新添加的缓存状态变量
const cachedStatus = ref(false);

const audio = new Audio();
audio.preload = "auto";

// 角色选项
const characterOptions = [
  { title: "成步堂龙一", value: "cbt", group: "律师" },
  { title: "绫里千寻", value: "qian", group: "律师" },
  { title: "王泥喜法介", value: "wang", group: "律师" },
  { title: "希月心音", value: "xin", group: "律师" },
  { title: "杜鲁克", value: "dhurke", group: "律师" },
  { title: "御剑怜侍", value: "yuj", group: "检察官" },
  { title: "狩魔豪", value: "hao", group: "检察官" },
  { title: "狩魔冥", value: "ming", group: "检察官" },
  { title: "戈多", value: "godo", group: "检察官" },
  { title: "亚内", value: "yanei", group: "检察官" },
  { title: "牙琉响也", value: "xiang", group: "检察官" },
  { title: "夕神迅", value: "xun", group: "检察官" },
  { title: "那由他", value: "nayuta", group: "检察官" },
  { title: "伽蓝", value: "garan", group: "检察官" },
];

// 语音类型
const voiceTypes = [
  { title: "異議あり!", value: "igiari", lang: "ja", group: "日语" },
  { title: "待った!", value: "matta", lang: "ja", group: "日语" },
  { title: "くらえ!", value: "kurae", lang: "ja", group: "日语" },
  { title: "黙りなァ!", value: "damarinaa", lang: "ja", group: "日语" },
  { title: "サトラ!", value: "satora-ja", lang: "ja", group: "日语" },
  { title: "ひれ伏せ!", value: "hirehuse", lang: "ja", group: "日语" },
  { title: "Objection!", value: "objection", lang: "en", group: "英语" },
  { title: "Hold It!", value: "holdit", lang: "en", group: "英语" },
  { title: "Take that!", value: "takethat", lang: "en", group: "英语" },
  { title: "Silence!", value: "silence", lang: "en", group: "英语" },
  { title: "Satorha!", value: "satorha", lang: "en", group: "英语" },
  { title: "Such Insolence!", value: "insolence", lang: "en", group: "英语" },
  { title: "异议!", value: "yiyi", lang: "zh", group: "汉语" },
  { title: "反对!", value: "fandui", lang: "zh", group: "汉语" },
  { title: "等等!", value: "dengdeng", lang: "zh", group: "汉语" },
  { title: "看招!", value: "kanzhao", lang: "zh", group: "汉语" },
  { title: "看这个!", value: "kanzhege", lang: "zh", group: "汉语" },
  { title: "闭嘴!", value: "bizui", lang: "zh", group: "汉语" },
  { title: "沙特拉!", value: "satora-cn", lang: "zh", group: "汉语" },
  { title: "还不跪下!", value: "guixia", lang: "zh", group: "汉语" },
];

// 角色语音映射
const characterVoices = {
  cbt: [
    "igiari",
    "objection",
    "yiyi",
    "fandui",
    "matta",
    "kurae",
    "dengdeng",
    "kanzhege",
    "kanzhao",
    "holdit",
    "takethat",
  ],
  qian: ["igiari", "objection", "yiyi", "matta", "kurae", "holdit", "takethat"],
  wang: [
    "igiari",
    "objection",
    "fandui",
    "matta",
    "kurae",
    "dengdeng",
    "kanzhege",
    "holdit",
    "takethat",
  ],
  xin: [
    "igiari",
    "objection",
    "fandui",
    "matta",
    "kurae",
    "dengdeng",
    "kanzhege",
    "holdit",
    "takethat",
  ],
  dhurke: ["igiari", "objection", "fandui"],
  yuj: [
    "igiari",
    "objection",
    "yiyi",
    "fandui",
    "matta",
    "kurae",
    "holdit",
    "takethat",
  ],
  hao: ["igiari", "objection", "yiyi"],
  ming: ["igiari", "objection", "yiyi"],
  godo: ["igiari", "objection", "yiyi"],
  xiang: ["igiari", "objection", "fandui"],
  yanei: ["igiari", "objection", "yiyi", "fandui"],
  xun: ["igiari", "damarinaa", "objection", "silence", "fandui", "bizui"],
  nayuta: [
    "igiari",
    "satora-ja",
    "objection",
    "satorha",
    "fandui",
    "satora-cn",
  ],
  garan: ["igiari", "hirehuse", "objection", "insolence", "fandui", "guixia"],
};

// 新增语言相关状态
const availableLanguages = ref([
  { code: "zh", name: "中文", icon: "mdi-earth" },
  { code: "en", name: "English", icon: "mdi-earth" },
]);

const currentLanguageName = computed(() => {
  return (
    availableLanguages.value.find((l) => l.code === locale.value)?.name ||
    "中文"
  );
});

// 修改语言切换函数
const changeLanguage = (langCode) => {
  locale.value = langCode;
  localStorage.setItem("userLanguage", langCode);
};

// 计算属性
const currentVoice = computed(() => voiceType.value);
const sensitivityInfo = computed(() =>
  sensitivity.value >= 20 ? "握紧设备！" : "平放于桌面"
);
const sensitivityMessage = computed(
  () => `[${sensitivity.value.toFixed(1)}] ${sensitivityInfo.value}`
);
const sensorData = computed(() => {
  const { x, y, z } = sensorValues.value;
  const { x: mx, y: my, z: mz } = maxValues.value;
  return `${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(
    2
  )}<br>Max: ${mx.toFixed(2)}, ${my.toFixed(2)}, ${mz.toFixed(2)}`;
});

const filteredVoiceTypes = computed(() => {
  const available = characterVoices[character.value] || [];
  return voiceTypes.filter((vt) => available.includes(vt.value));
});

const audioCacheKey = computed(() => {
  return `cachedMP3_${audioFilePath.value}`;
});

const audioFilePath = computed(() => {
  return `sound/${character.value}/${voiceType.value}.mp3`;
});

// 更新缓存状态
const updateCachedStatus = () => {
  cachedStatus.value = localStorage.getItem(audioCacheKey.value) !== null;
};

// 方法
const toggleUI = () => {
  showUI.value = !showUI.value;
};

const resetSensor = () => {
  maxValues.value = { x: 0, y: 0, z: 0 };
};

const playAudio = async () => {
  if (playing.value) return;

  try {
    playing.value = true;
    await loadAndPlayAudio();
    // 播放后更新缓存状态
    updateCachedStatus();

    if (vibrationEnabled.value && navigator.vibrate) {
      navigator.vibrate(400);
    }
    setTimeout(() => {
      playing.value = false;
      if (autoPlayMusic.value) {
        document.querySelector("meting-js")?.aplayer?.play();
      }
    }, 1300);
  } catch (error) {
    console.error("播放音频失败:", error);
    setTimeout(() => {
      playing.value = false;
    }, 1300);
  }
};

const loadAndPlayAudio = async () => {
  const cachedAudio = localStorage.getItem(audioCacheKey.value);

  if (cachedAudio) {
    audio.src = cachedAudio;
    audio.volume = volume.value;
    try {
      await audio.play();
      return;
    } catch (error) {
      console.error("播放缓存音频失败:", error);
      throw error;
    }
  }

  // 下载并缓存音频
  try {
    const response = await fetch(audioFilePath.value);
    if (!response.ok) throw new Error("音频加载失败");

    const blob = await response.blob();
    const base64data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    localStorage.setItem(audioCacheKey.value, base64data);
    audio.src = base64data;
    audio.volume = volume.value;
    await audio.play();
    // 缓存后更新状态
    cachedStatus.value = true;
  } catch (error) {
    console.error("音频加载和播放失败:", error);
    throw error;
  }
};

const confirmClearCache = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("cachedMP3_")) {
      localStorage.removeItem(key);
    }
  });
  // 清空缓存后更新状态
  cachedStatus.value = false;
  showClearCacheDialog.value = false;
};

// 新增鼠标移动相关状态
const mousePosition = ref({ x: 0, y: 0 });
const lastMousePosition = ref({ x: 0, y: 0 });
const mouseMoveThreshold = ref(sensitivity); // 鼠标移动触发阈值

// 监听鼠标移动
const handleMouseMove = (event) => {
  if (!mousemode.value) return;

  // 更新鼠标位置
  mousePosition.value = {
    x: event.clientX,
    y: event.clientY,
  };

  // 计算移动距离
  const deltaX = Math.abs(mousePosition.value.x - lastMousePosition.value.x);
  const deltaY = Math.abs(mousePosition.value.y - lastMousePosition.value.y);

  // 如果移动距离超过阈值，触发异议
  if (deltaX > mouseMoveThreshold.value || deltaY > mouseMoveThreshold.value) {
    playAudio();
    lastMousePosition.value = { ...mousePosition.value };
  }
};

const toggleMouseMode = () => {
  mousemode.value = !mousemode.value;

  if (mousemode.value) {
    document.addEventListener("mousemove", handleMouseMove);
    document.body.classList.add("hide-cursor");
  } else {
    document.removeEventListener("mousemove", handleMouseMove);
    document.body.classList.remove("hide-cursor");
  }
};

const handleDeviceMotion = (event) => {
  const acc = event.acceleration;
  if (!acc) return;

  const accx = acc.x || 0;
  const accy = acc.y || 0;
  const accz = acc.z || 0;

  sensorValues.value = { x: accx, y: accy, z: accz };

  // 更新最大值
  if (Math.abs(accx) > Math.abs(maxValues.value.x)) maxValues.value.x = accx;
  if (Math.abs(accy) > Math.abs(maxValues.value.y)) maxValues.value.y = accy;
  if (Math.abs(accz) > Math.abs(maxValues.value.z)) maxValues.value.z = accz;

  // 检测是否需要触发异议
  if (
    Math.abs(accx) >= sensitivity.value ||
    Math.abs(accy) >= sensitivity.value ||
    Math.abs(accz) >= sensitivity.value
  ) {
    playAudio();
  }
};

const requestIOSPermission = async () => {
  if (typeof DeviceOrientationEvent.requestPermission !== "function")
    return false;
  const permission = await DeviceOrientationEvent.requestPermission();
  return permission === "granted";
};

const setupMotionDetection = async () => {
  if (typeof DeviceMotionEvent === "undefined") {
    console.warn("设备不支持运动传感器");
    return;
  }

  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    const granted = await requestIOSPermission();
    if (granted) {
      window.addEventListener("devicemotion", handleDeviceMotion);
      sensorStatus.value = true;
    }
  } else {
    window.addEventListener("devicemotion", handleDeviceMotion);
    sensorStatus.value = true;
  }
};

const toggleTheme = () => {
  theme.global.name.value = dark.value ? "light" : "dark";
  dark.value = !dark.value;
};

// 处理键盘快捷键
const handleKeydown = (event) => {
  if (event.ctrlKey && event.shiftKey && event.key === "Z") {
    event.preventDefault();
    toggleMouseMode();
  }
};

// 生命周期钩子
onMounted(() => {
  setupMotionDetection();
  window.addEventListener("keydown", handleKeydown);
  if (mousemode.value) {
    document.addEventListener("mousemove", handleMouseMove);
    document.body.classList.add("hide-cursor");
  }

  // 初始化时更新缓存状态
  updateCachedStatus();
});

onUnmounted(() => {
  window.removeEventListener("devicemotion", handleDeviceMotion);
  window.removeEventListener("keydown", handleKeydown);
  if (mousemode.value) {
    document.removeEventListener("mousemove", handleMouseMove);
    document.body.classList.remove("hide-cursor");
  }
});

// 监听设置变化
watch(character, (newVal) => {
  settingsStore.setCharacter(newVal);

  // 确保当前选择的语音类型有效
  if (!characterVoices[newVal].includes(voiceType.value)) {
    voiceType.value = characterVoices[newVal][0];
  }

  // 预加载新角色的音频
  loadAndPlayAudio();

  // 更新缓存状态
  updateCachedStatus();
});

watch(voiceType, (newVal) => {
  settingsStore.setVoiceType(newVal);
  loadAndPlayAudio();
  updateCachedStatus();
});

watch(sensitivity, (newVal) => {
  settingsStore.setSensitivity(newVal);
});

watch(volume, (newVal) => {
  settingsStore.setVolume(newVal);
  audio.volume = newVal;
});

watch(autoPlayMusic, (newVal) => {
  settingsStore.setAutoPlayMusic(newVal);
});

watch(vibrationEnabled, (newVal) => {
  settingsStore.setVibrationEnabled(newVal);
});

// 初始化检查存储的语言设置
const savedLanguage = localStorage.getItem("userLanguage");
if (savedLanguage) {
  locale.value = savedLanguage;
}
</script>

<style scoped>
.objection-content {
  width: 95%;
  max-width: 700px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.objection-image {
  max-width: 100%;
  max-height: 100%;
  transition: opacity 0.3s;
}

.objection-hide {
  opacity: 0;
}

.control-panel {
  position: relative;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.v-theme--dark .control-panel {
  background: rgba(30, 30, 30, 0.85);
}

.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  z-index: 101;
  width: 0px;
}

.sensitivity-info {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 8px;
}

.v-theme--dark .sensitivity-info {
  color: rgba(255, 255, 255, 0.7);
}

.shake-animation {
  animation: shake 300ms ease-in-out;
}

.hide-cursor {
  cursor: none;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-2px, 2px, 0);
  }

  20%,
  80% {
    transform: translate3d(4px, -4px, 0);
  }

  30%,
  70% {
    transform: translate3d(-8px, 8px, 0);
  }

  40%,
  60% {
    transform: translate3d(6px, -6px, 0);
  }

  50% {
    transform: translate3d(-8px, 8px, 0);
  }

  45%,
  55% {
    transform: translate3d(4px, 4px, 0);
  }

  35%,
  65% {
    transform: translate3d(-6px, -6px, 0);
  }

  25%,
  75% {
    transform: translate3d(10px, 10px, 0);
  }

  15%,
  85% {
    transform: translate3d(-8px, -8px, 0);
  }
}

.lang-menu {
  min-width: 120px;
}

/* 语言选择器选项样式 */
.v-list-item {
  cursor: pointer;
  transition: background-color 0.3s;
}

.v-list-item:hover {
  background-color: rgba(0, 176, 255, 0.1);
}

/* 确保根元素允许滚动 */
html,
body,
#app {
  height: 100%;
  overflow: auto;
}

/* 修改 v-main 的样式 */
.v-main {
  overflow-y: auto;
  height: calc(100vh - 64px);
  /* 减去顶部标题栏高度 */
}

/* 调整控制面板的样式 */
.control-panel {
  overflow-y: auto;
  max-height: 60vh;
  max-width: 700px;
  margin: 0 auto;
}

.music-player {
  position: relative;
  height: auto;
}

.toggle-ui-btn {
  position: fixed;
  bottom: 60px;
  right: 20px;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.v-theme--dark .toggle-ui-btn {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.lang-btn {
  text-transform: none;
}
</style>