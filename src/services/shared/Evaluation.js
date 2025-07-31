export var SkillLevel;
(function (SkillLevel) {
    SkillLevel[SkillLevel["NotReturned"] = -3] = "NotReturned";
    SkillLevel[SkillLevel["Dispensed"] = -2] = "Dispensed";
    SkillLevel[SkillLevel["Absent"] = -1] = "Absent";
    SkillLevel[SkillLevel["None"] = 0] = "None";
    SkillLevel[SkillLevel["Insufficient"] = 1] = "Insufficient";
    SkillLevel[SkillLevel["Beginning"] = 2] = "Beginning";
    SkillLevel[SkillLevel["Fragile"] = 3] = "Fragile";
    SkillLevel[SkillLevel["AlmostMastered"] = 4] = "AlmostMastered";
    SkillLevel[SkillLevel["Satisfactory"] = 5] = "Satisfactory";
    SkillLevel[SkillLevel["Excellent"] = 6] = "Excellent"; // Très bonne maîtrise
})(SkillLevel || (SkillLevel = {}));
