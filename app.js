const deviceSelect = document.querySelector("#device-select");
const devicePanel = document.querySelector("#device-panel");
const firmwarePanel = document.querySelector("#firmware-panel");
const emptyPanel = document.querySelector("#empty-panel");
const errorPanel = document.querySelector("#error-panel");
const errorText = document.querySelector("#error-text");
const deviceCount = document.querySelector("#device-count");
const firmwareCount = document.querySelector("#firmware-count");
const lastUpdated = document.querySelector("#last-updated");
const deviceName = document.querySelector("#device-name");
const deviceMeta = document.querySelector("#device-meta");
const deviceStatus = document.querySelector("#device-status");
const deviceDesc = document.querySelector("#device-desc");
const firmwareList = document.querySelector("#firmware-list");

const state = {
  data: null,
  currentId: "",
};

const buildChip = (text, accent = false) => {
  const span = document.createElement("span");
  span.className = accent ? "chip accent" : "chip";
  span.textContent = text;
  return span;
};

const updatePanels = (device) => {
  devicePanel.hidden = !device;
  firmwarePanel.hidden = !device;
  emptyPanel.hidden = !!device && device.firmwares.length > 0;
  if (!device) {
    firmwarePanel.hidden = true;
    emptyPanel.hidden = true;
  }
};

const renderDevice = (device) => {
  if (!device) {
    firmwareList.innerHTML = "";
    deviceDesc.textContent = "—";
    deviceName.textContent = "设备名称";
    deviceMeta.textContent = "固件列表 · 版本/日期/标签";
    deviceStatus.textContent = "固件数 · 0";
    firmwareCount.textContent = "固件 · 0";
    updatePanels(null);
    return;
  }

  deviceName.textContent = device.name || state.currentId || "设备名称";
  deviceMeta.textContent = "固件列表 · 版本/日期/标签";
  deviceDesc.textContent = "请选择需要的版本，跳转第三方链接下载。";
  deviceStatus.textContent = `固件数 · ${device.firmwares.length}`;
  firmwareCount.textContent = `固件 · ${device.firmwares.length}`;

  const firmwares = [...device.firmwares].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  firmwareList.innerHTML = "";

  firmwares.forEach((fw, index) => {
    const card = document.createElement("article");
    card.className = "fw-card";

    const header = document.createElement("div");
    header.className = "fw-header";

    const title = document.createElement("div");
    const version = document.createElement("div");
    version.className = "fw-version";
    version.textContent = `v${fw.version}`;

    const meta = document.createElement("div");
    meta.className = "fw-meta";
    const sizeLabel = fw.size ? ` · ${fw.size}` : "";
    const tagLabel = fw.tag ? ` · ${fw.tag}` : "";
    meta.textContent = `${fw.date}${sizeLabel}${tagLabel}`;

    if (index === 0) {
      meta.appendChild(document.createTextNode(" · 最新"));
    }

    title.appendChild(version);
    title.appendChild(meta);

    const action = document.createElement("a");
    action.className = "btn primary";
    action.href = fw.file;
    action.setAttribute("target", "_blank");
    action.setAttribute("rel", "noopener");
    action.textContent = "前往下载";

    header.appendChild(title);
    header.appendChild(action);

    const footer = document.createElement("div");
    footer.className = "fw-footer";
    if (fw.tag) footer.appendChild(buildChip(`标签 ${fw.tag}`));

    card.appendChild(header);
    if (footer.children.length) {
      card.appendChild(footer);
    }
    firmwareList.appendChild(card);
  });

  updatePanels(device);
};

const populateDevices = (data) => {
  const deviceIds = Object.keys(data.devices || {});
  deviceSelect.innerHTML = "<option value=\"\">请选择设备型号</option>";
  deviceIds.forEach((id) => {
    const device = data.devices[id];
    if (!device) return;
    const option = document.createElement("option");
    option.value = id;
    option.textContent = id;
    deviceSelect.appendChild(option);
  });

  deviceCount.textContent = `设备数 · ${deviceIds.length}`;
  if (lastUpdated) {
    lastUpdated.textContent = `最近更新 · ${data.lastUpdated}`;
  }
};

const loadData = async () => {
  try {
    const response = await fetch("firmware.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    state.data = data;
    populateDevices(data);
  } catch (error) {
    errorPanel.hidden = false;
    errorText.textContent = `无法读取固件列表：${error.message}`;
  }
};

const handleSelect = () => {
  if (!state.data) return;
  const id = deviceSelect.value;
  state.currentId = id;
  const firmwares = state.data.devices[id];
  const device = Array.isArray(firmwares)
    ? { name: id, firmwares }
    : null;
  renderDevice(device);
  if (device && device.firmwares.length === 0) {
    emptyPanel.hidden = false;
  }
};

deviceSelect.addEventListener("change", handleSelect);

loadData();

