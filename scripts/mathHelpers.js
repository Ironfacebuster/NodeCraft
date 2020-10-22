module.exports.clampToGrid = (val, grid) => {
    return Math.round(val / grid) * grid
}