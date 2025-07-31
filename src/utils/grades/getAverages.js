// Memoization cache for subject averages
var subjectAverageCache = new Map();
var getCacheKey = function (subject, target, useMath, loop) {
    return "".concat(target, "-").concat(useMath, "-").concat(loop, "-").concat(subject.map(function (g) { var _a; return (_a = g.subjectId) !== null && _a !== void 0 ? _a : g.subjectName; }).join(","));
};
var getPronoteAverage = function (grades, target, useMath) {
    var _a;
    if (target === void 0) { target = "student"; }
    if (useMath === void 0) { useMath = false; }
    if (!(grades === null || grades === void 0 ? void 0 : grades.length))
        return -1;
    var groupedBySubject = {};
    var countedSubjects = 0;
    var totalAverage = 0;
    // Optimized grouping
    for (var i = 0; i < grades.length; i++) {
        var grade = grades[i];
        var key = (_a = grade.subjectId) !== null && _a !== void 0 ? _a : grade.subjectName;
        groupedBySubject[key] = groupedBySubject[key] || [];
        groupedBySubject[key].push(grade);
    }
    var subjects = Object.values(groupedBySubject);
    for (var i = 0; i < subjects.length; i++) {
        var nAvg = getSubjectAverage(subjects[i], target, useMath);
        if (nAvg !== -1) {
            countedSubjects++;
            totalAverage += nAvg;
        }
    }
    return countedSubjects > 0 ? totalAverage / countedSubjects : -1;
};
export var getSubjectAverage = function (subject, target, useMath, loop) {
    if (target === void 0) { target = "student"; }
    if (useMath === void 0) { useMath = false; }
    if (loop === void 0) { loop = false; }
    var cacheKey = getCacheKey(subject, target, useMath, loop);
    var cachedValue = subjectAverageCache.get(cacheKey);
    if (cachedValue !== undefined)
        return cachedValue;
    var calcGradesSum = 0;
    var calcOutOfSum = 0;
    var countedGrades = 0;
    var _loop_1 = function (i) {
        var grade = subject[i];
        var targetGrade = grade[target];
        if (!targetGrade ||
            targetGrade.disabled ||
            targetGrade.value === null ||
            targetGrade.value < 0 ||
            grade.coefficient === 0 ||
            typeof targetGrade.value !== "number") {
            return "continue";
        }
        var coefficient = grade.coefficient;
        var outOfValue = grade.outOf.value;
        if (grade.isOptional && !loop) {
            var filteredSubject = subject.filter(function (g, idx) { return idx !== i; });
            var avgWithout = getSubjectAverage(filteredSubject, target, useMath, true);
            var avgWith = getSubjectAverage(subject, target, useMath, true);
            if (avgWithout > avgWith) {
                return "continue";
            }
        }
        if (grade.isBonus) {
            var averageMoy = outOfValue / 2;
            var newGradeValue = targetGrade.value - averageMoy;
            if (newGradeValue >= 0) {
                calcGradesSum += newGradeValue;
                calcOutOfSum += 1;
            }
        }
        else if (useMath) {
            calcGradesSum += targetGrade.value * coefficient;
            countedGrades += coefficient;
        }
        else {
            if (targetGrade.value > 20 || (coefficient < 1 && outOfValue - 20 >= -5) || outOfValue > 20) {
                var gradeOn20 = (targetGrade.value / outOfValue) * 20;
                calcGradesSum += gradeOn20 * coefficient;
                calcOutOfSum += 20 * coefficient;
            }
            else {
                calcGradesSum += targetGrade.value * coefficient;
                calcOutOfSum += outOfValue * coefficient;
            }
            countedGrades++;
        }
    };
    for (var i = 0; i < subject.length; i++) {
        _loop_1(i);
    }
    var result = 0;
    if (useMath) {
        result = countedGrades > 0 ? calcGradesSum / countedGrades : -1;
    }
    else if (calcOutOfSum > 0) {
        result = Math.min((calcGradesSum / calcOutOfSum) * 20, 20);
        result = isNaN(result) ? -1 : result;
    }
    subjectAverageCache.set(cacheKey, result);
    return result;
};
var getAverageDiffGrade = function (grades, list, target, useMath) {
    if (target === void 0) { target = "student"; }
    if (useMath === void 0) { useMath = false; }
    try {
        var baseAverage = getSubjectAverage(list, target);
        var filteredList = list.filter(function (grade) {
            return !grades.some(function (g) {
                return g.student.value === grade.student.value &&
                    g.coefficient === grade.coefficient;
            });
        });
        var baseWithoutGradeAverage = getSubjectAverage(filteredList, target, useMath);
        return {
            difference: baseWithoutGradeAverage - baseAverage,
            with: baseAverage,
            without: baseWithoutGradeAverage,
        };
    }
    catch (e) {
        return {
            difference: 0,
            with: 0,
            without: 0,
        };
    }
};
var getAveragesHistory = function (grades, target, final, useMath) {
    if (target === void 0) { target = "student"; }
    if (useMath === void 0) { useMath = false; }
    if (!(grades === null || grades === void 0 ? void 0 : grades.length))
        return [];
    var history = [];
    var cumulativeGrades = [];
    var lastDate = "";
    // Pre-allocate array
    history.length = grades.length;
    for (var i = 0; i < grades.length; i++) {
        cumulativeGrades.push(grades[i]);
        var currentDate = new Date(grades[i].timestamp).toISOString();
        // Only add to history if date changed to reduce calculations
        if (currentDate !== lastDate) {
            history[i] = {
                value: getPronoteAverage(cumulativeGrades, target),
                date: currentDate
            };
            lastDate = currentDate;
        }
    }
    // Filter out undefined entries and sort
    var filteredHistory = history.filter(Boolean);
    filteredHistory.sort(function (a, b) { return a.date.localeCompare(b.date); });
    // Add final value
    var finalValue = final !== null && final !== void 0 ? final : getPronoteAverage(grades, target, useMath);
    if (!isNaN(finalValue)) {
        filteredHistory.push({
            value: finalValue,
            date: new Date().toISOString()
        });
    }
    return filteredHistory;
};
export { getPronoteAverage, getAverageDiffGrade, getAveragesHistory };
