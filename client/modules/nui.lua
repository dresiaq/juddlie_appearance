local config <const> = require("config")

local localeModule = nil
pcall(function()
  localeModule = require("shared.locale")
  localeModule.init()
end)

local nui = {}

nui.ready = false
nui.visible = false

---@param key string
---@param fallback string
---@return string
local function tr(key, fallback)
  if not localeModule then return fallback end

  local value <const> = localeModule.t(key)
  if value == key then return fallback end

  return value
end

---@param entry any
---@return boolean
local function isSetPedOnly(entry)
  return type(entry) == "table" and (
    entry.setpedOnly == true
    or entry.setPedOnly == true
    or entry.hidden == true
    or entry.hiddenFromCreator == true
  )
end

---@param models table?
---@param includeHidden boolean?
---@return table
local function normalizePedModels(models, includeHidden)
  local output = {}

  for _, entry in ipairs(models or {}) do
    local value, label

    if type(entry) == "string" then
      value = entry
      label = entry
    elseif type(entry) == "table" then
      value = entry.value or entry.model
      label = entry.label or value
      if entry.labelLocale then
        label = tr(entry.labelLocale, label or value)
      end
    end

    if value and (includeHidden or not isSetPedOnly(entry)) then
      output[#output + 1] = { value = value, label = tr("ui.peds." .. value, label or value) }
    end
  end

  return output
end

---@param list table?
---@param prefix string
---@param valueKey string?
---@return table
local function localizeOptions(list, prefix, valueKey)
  local output = {}
  valueKey = valueKey or "value"

  for _, item in ipairs(list or {}) do
    local copy = {}
    for k, v in pairs(item) do copy[k] = v end

    local value <const> = tostring(copy[valueKey] or copy.key or "")
    if value ~= "" then
      local keyPart <const> = value:gsub("%s+", "_"):lower()
      copy.label = tr(prefix .. keyPart, copy.label or value)
      if copy.desc then
        copy.desc = tr(prefix .. keyPart .. "_desc", copy.desc)
      end
    end

    output[#output + 1] = copy
  end

  return output
end

---@param labels table?
---@param prefix string
---@return table
local function localizeLabelMap(labels, prefix)
  local output = {}

  for key, value in pairs(labels or {}) do
    output[key] = tr(prefix .. tostring(key), value)
  end

  return output
end

---@return table
local function getLocalizedOverlayLabels()
  local keys <const> = {
    "blemishes", "facial_hair", "eyebrows", "ageing", "makeup",
    "blush", "complexion", "sun_damage", "lipstick", "moles_freckles",
    "chest_hair", "body_blemishes", "add_body_blemishes",
  }

  local output = {}
  for index, label in ipairs(config.overlayLabels or {}) do
    output[index] = tr("ui.overlays." .. (keys[index] or tostring(index)), label)
  end

  return output
end

---@return table
local function getLocalizedFaceRegions()
  local output = {}
  local regionKeys <const> = {
    Eyes = "eyes", Nose = "nose", Cheeks = "cheeks", Jaw = "jaw",
    Chin = "chin", Lips = "lips", Neck = "neck",
  }

  for _, region in ipairs(config.faceRegions or {}) do
    output[#output + 1] = {
      name = tr("ui.face." .. (regionKeys[region.name] or region.name:lower()), region.name),
      features = region.features,
    }
  end

  return output
end

---@return table
local function getRandomizerCategories()
  if not config.rcoreTattoosCompatibility then
    return localizeOptions(config.randomizerCategories, "ui.randomizer.category_", "key")
  end

  local categories = {}
  for _, category in ipairs(config.randomizerCategories or {}) do
    if category.key ~= "tattoos" then
      categories[#categories + 1] = category
    end
  end

  return localizeOptions(categories, "ui.randomizer.category_", "key")
end

---@return table?
local function getPedMenuPedModels()
  if not config.pedMenu or type(config.pedMenu.models) ~= "table" then
    return nil
  end

  return normalizePedModels(config.pedMenu.models, config.pedMenu.showSetPedOnly == true)
end

---@return table?
local function getAssignedPed()
  return lib.callback.await("juddlie_appearance:server:getPedAssignment", false)
end

---@return boolean
function nui.isVisible()
  return nui.visible
end

---@param visible boolean
---@param focus boolean?
function nui.setVisible(visible, focus)
  if type(focus) == "boolean" then
    SetNuiFocus(visible, visible)
  end

  nui.visible = visible
  nui.sendMessage("setVisible", { visible = visible })
end

---@param action string
---@param data table?
function nui.sendMessage(action, data)
  data = data or {}

  SendNUIMessage({ action = action, data = data })
end

---@param message string
---@param handler function
function nui.handleMessage(message, handler)
  RegisterNUICallback(message, function(body, cb)
    handler(body)
    cb("ok")
  end)
end

nui.handleMessage("ready", function()
  if nui.ready then return end

  nui.ready = true
  nui.sendMessage("setConfig", {
    cameraPresets = localizeOptions(config.cameraPresets, "ui.camera."),
    lightingPresets = localizeOptions(config.lightingPresets, "ui.camera."),
    cameraDefaults = config.cameraDefaults,
    cameraRanges = config.cameraRanges,
    randomizerDefaultSpeed = config.randomizerDefaultSpeed,
    randomizerSpeedRange = config.randomizerSpeedRange,
    eyeColorMax = config.eyeColorMax,
    animations = localizeOptions(config.animations, "ui.animations."),
    overlayLabels = getLocalizedOverlayLabels(),
    overlayGroups = config.overlayGroups,
    headBlendRanges = config.headBlendRanges,
    faceFeatureLabels = localizeLabelMap(config.faceFeatureLabels, "ui.face_features."),
    componentLabels = localizeLabelMap(config.componentLabels, "ui.components."),
    clothingComponentGroups = config.clothingComponentGroups,
    accessoryComponentIds = config.accessoryComponentIds,
    propLabels = localizeLabelMap(config.propLabels, "ui.prop_labels."),
    propIds = config.propIds,
    tattooZones = config.rcoreTattoosCompatibility and {} or localizeOptions(config.tattooZones, "ui.tattoos."),
    faceRegions = getLocalizedFaceRegions(),
    quickSlots = localizeOptions(config.quickSlots, "ui.quick_slots.", "label"),
    randomizerCategories = getRandomizerCategories(),
    walkStyles = localizeOptions(config.walkStyles or {}, "ui.walkstyles."),
    walkStyleCategories = localizeOptions(config.walkStyleCategories or {}, "ui.walkstyle.category_"),
    pedModels = normalizePedModels(config.pedModels, false),
    pedMenuPedModels = getPedMenuPedModels(),
    pedMenuActive = false,
    assignedPed = getAssignedPed(),
    outfitCategories = localizeOptions(config.outfitCategories, "ui.outfits."),
    locale = config.locale or "en",
    localeStrings = localeModule and localeModule.getAll() or {},
    disabledComponents = config.disabledComponents or {},
    disabledProps = config.disabledProps or {},
    accentColor = config.accentColor or "blue",
    prices = config.prices or {},
    outfitCategoryColors = config.outfitWheel and config.outfitWheel.categoryColors or {},
    marketplace = config.marketplace or {},
    share = config.share or {},
    dropTierColors = config.drops and config.drops.tierColors or {},
    rcoreTattoosCompatibility = config.rcoreTattoosCompatibility == true,
  })
end)

return nui