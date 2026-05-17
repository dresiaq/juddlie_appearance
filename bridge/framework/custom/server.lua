local config <const> = require("config")

local bridge = {}

---@param src number|string
---@return string?
local function getCharacterId(src)
  local multi <const> = config.multiCharacter
  if not multi or not multi.enabled then return nil end

  if type(multi.getCharacterId) == "function" then
    local ok, value = pcall(multi.getCharacterId, src)
    if ok and value ~= nil and value ~= "" then
      return tostring(value)
    end
  end

  if multi.stateBag then
    local player <const> = Player(src)
    local value = player and player.state and player.state[multi.stateBag]
    if value ~= nil and value ~= "" then
      return tostring(value)
    end
  end

  return nil
end

---@param src string
---@return string?
function bridge.getIdentifier(src)
  local identifier <const> = GetPlayerIdentifierByType(src, config.licenseType)
  if not identifier then return end
  
  local cleaned <const> = identifier:gsub("^.-:", "")

  local characterId <const> = getCharacterId(src)
  if characterId then
    return cleaned .. (config.multiCharacter.separator or ":") .. characterId
  end

  return cleaned
end

---@param src number|string
---@return table
function bridge.getPlayerData(src)
  local identifier <const> = bridge.getIdentifier(tostring(src))

  return {
    identifier = identifier,
    job = nil,
    jobGrade = 0,
    gang = nil,
  }
end

---@param src number
---@param moneyType string
---@param amount number
---@return boolean
function bridge.hasMoney(src, moneyType, amount)
  return true
end

---@param src number
---@param moneyType string
---@param amount number
---@return boolean
function bridge.removeMoney(src, moneyType, amount)
  return true
end

---@param src number
---@param moneyType string
---@param amount number
---@return boolean
function bridge.addMoney(src, moneyType, amount)
  return true
end

return bridge