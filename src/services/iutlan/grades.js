var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import uuid from "@/utils/uuid-v4";
export var saveIUTLanGrades = function (account, periodName) { return __awaiter(void 0, void 0, void 0, function () {
    var data, scodocData, ressources_1, saes_1, matieres_1, gradesList_1, averages_1;
    return __generator(this, function (_a) {
        try {
            data = account.serviceData.semestres;
            scodocData = data[periodName];
            if (!scodocData) {
                return [2 /*return*/, {
                        grades: [],
                        averages: {
                            classOverall: {
                                value: null,
                                disabled: true,
                                status: null,
                            },
                            overall: {
                                value: null,
                                disabled: true,
                                status: null,
                            },
                            subjects: []
                        }
                    }];
            }
            ressources_1 = scodocData["relevé"].ressources;
            saes_1 = scodocData["relevé"].saes;
            Object.keys(ressources_1).forEach(function (key) {
                ressources_1[key].type = "ressource";
            });
            Object.keys(saes_1).forEach(function (key) {
                saes_1[key].type = "sae";
            });
            matieres_1 = __assign(__assign({}, ressources_1), saes_1);
            gradesList_1 = [];
            averages_1 = {
                classOverall: {
                    value: null,
                    disabled: true,
                    status: null,
                },
                overall: {
                    value: null,
                    disabled: true,
                    status: null,
                },
                subjects: []
            };
            Object.keys(matieres_1).forEach(function (key) {
                var matiere = matieres_1[key];
                var subjectName = matiere.type === "sae"
                    ? key + " - " + matiere.titre + " > " + key
                    : matiere.titre + " > " + key;
                var subject = {
                    id: uuid(),
                    name: subjectName,
                };
                var grades = matiere.evaluations.map(function (note) {
                    var parsedStudent = note.note.value !== "~" ? parseFloat(note.note.value) : null; // Create a condition when ~ ("~" appears when a grade is not already put in scodoc)
                    var parsedAverage = note.note.moy !== "~" ? parseFloat(note.note.moy) : null;
                    var parsedMin = note.note.min !== "~" ? parseFloat(note.note.min) : null;
                    var parsedMax = note.note.max !== "~" ? parseFloat(note.note.max) : null;
                    var grade = {
                        student: {
                            value: parseFloat(note.note.value),
                            disabled: parsedStudent === null || isNaN(parsedStudent),
                            status: null,
                        },
                        min: {
                            value: parseFloat(note.note.min),
                            disabled: parsedMin === null || isNaN(parsedMin),
                            status: null,
                        },
                        max: {
                            value: parseFloat(note.note.max),
                            disabled: parsedMax === null || isNaN(parsedMax),
                            status: null,
                        },
                        average: {
                            value: parseFloat(note.note.moy),
                            disabled: parsedAverage === null || isNaN(parsedAverage),
                            status: null,
                        },
                        id: uuid(),
                        outOf: {
                            value: 20,
                            disabled: false,
                            status: null,
                        },
                        description: note.description,
                        timestamp: new Date(note.date).getTime(),
                        coefficient: parseFloat(note.coef),
                        isBonus: false,
                        isOptional: false,
                        subjectName: subject.name,
                    };
                    gradesList_1.push(grade);
                    return grade;
                });
                //
                var average = grades.filter(function (grade) { return grade.student.value != null && !isNaN(grade.student.value); }).length > 0 ? grades.filter(function (grade) { return grade.student.value != null && !isNaN(grade.student.value); }).reduce(function (acc, grade) { return acc + grade.student.value; }, 0) / grades.filter(function (grade) { return grade.student.value != null && !isNaN(grade.student.value); }).length : NaN;
                var min = grades.filter(function (grade) { return grade.min.value != null && !isNaN(grade.min.value); }).length > 0 ? grades.filter(function (grade) { return grade.min.value != null && !isNaN(grade.min.value); }).reduce(function (acc, grade) { return Math.min(acc, grade.min.value); }, 20) : NaN;
                var max = grades.filter(function (grade) { return grade.max.value != null && !isNaN(grade.max.value); }).length > 0 ? grades.filter(function (grade) { return grade.max.value != null && !isNaN(grade.max.value); }).reduce(function (acc, grade) { return Math.max(acc, grade.max.value); }, 0) : NaN;
                var classAverage = grades.filter(function (grades) { return grades.average.value != null && !isNaN(grades.average.value); }).length > 0 ? grades.filter(function (grades) { return grades.average.value != null && !isNaN(grades.average.value); }).reduce(function (acc, grade) { return acc + grade.average.value; }, 0) / grades.filter(function (grades) { return grades.average.value != null && !isNaN(grades.average.value); }).length : NaN;
                if (grades.length === 0) {
                    return;
                }
                averages_1.subjects.push({
                    classAverage: {
                        value: classAverage,
                        disabled: false,
                        status: null,
                    },
                    color: "#888888",
                    max: {
                        value: max,
                        disabled: false,
                        status: null,
                    },
                    subjectName: subject.name,
                    min: {
                        value: min,
                        disabled: false,
                        status: null,
                    },
                    average: {
                        value: average,
                        disabled: false,
                        status: null,
                    },
                    outOf: {
                        value: 20,
                        disabled: false,
                        status: null,
                    },
                });
            });
            return [2 /*return*/, { grades: gradesList_1, averages: averages_1 }];
        }
        catch (e) {
            console.error(e);
            return [2 /*return*/, {
                    grades: [],
                    averages: {
                        classOverall: {
                            value: null,
                            disabled: true,
                            status: null,
                        },
                        overall: {
                            value: null,
                            disabled: true,
                            status: null,
                        },
                        subjects: []
                    }
                }];
        }
        return [2 /*return*/];
    });
}); };
export var saveIUTLanPeriods = function (account) { return __awaiter(void 0, void 0, void 0, function () {
    var scodocData, semestresData, semestres, finalData;
    return __generator(this, function (_a) {
        scodocData = account.identityProvider.rawData;
        semestresData = account.serviceData.semestres;
        semestres = scodocData["semestres"].map(function (semestre) {
            var semestreName = "Semestre " + semestre.semestre_id;
            var innerData = semestresData[semestreName];
            var startTime = innerData["relevé"].semestre.date_debut ? new Date(innerData["relevé"].semestre.date_debut).getTime() : 1609459200;
            var endTime = innerData["relevé"].semestre.date_fin ? new Date(innerData["relevé"].semestre.date_fin).getTime() : 1622505600;
            return {
                name: semestreName,
                startTimestamp: startTime,
                endTimestamp: endTime,
            };
        });
        finalData = {
            periods: semestres.length > 0 ? semestres : [
                {
                    name: "Toutes",
                    startTimestamp: 1609459200,
                    endTimestamp: 1622505600
                },
            ],
            defaultPeriod: semestres.length > 0 ? semestres[semestres.length - 1].name : "Toutes"
        };
        return [2 /*return*/, finalData];
    });
}); };
