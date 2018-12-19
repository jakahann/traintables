// Fetches the full name for the station from shortCode
export function getCityName(ourCode, allStations) {
  for (const key in allStations) {
    if (ourCode == allStations[key]) return key
  }
  return null
}

// Returns at what time train should arrive or leave the station
export function getScheduledTime(train, selected, way) {
  for (const stop of train.timeTableRows) {
    if (stop.stationShortCode == selected && stop.type == way) {
      return stop.scheduledTime
    }
  }
}

// Check if train is cancelled
export function isCancelled(train, selected, way) {
  for (const stop of train.timeTableRows) {
    if (stop.stationShortCode == selected && stop.type == way) {
      return stop.cancelled
    }
  }
}

// Get schedule difference in minutes
export function getDifference(train, selected, way) {
  for (const stop of train.timeTableRows) {
    if (stop.stationShortCode == selected && stop.type == way) {
      return stop.differenceInMinutes
    }
  }
}

// Checks which variant for cell: cancelled -> customized danger else no variant
export function checkVariant(train) {
  if (this.isCancelled(train)) return "danger"
  return ""
}

// Returns train name
export function getTrainName(train) {
  if (train.trainCategory == "Commuter")
    return `Paikallisjuna ${train.commuterLineID}`
  return `${train.trainType} ${train.trainNumber}`
}
