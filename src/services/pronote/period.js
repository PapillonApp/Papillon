export function decodePeriod(p) {
    return {
        name: p.name,
        startTimestamp: p.startDate.getTime(),
        endTimestamp: p.endDate.getTime()
    };
}
