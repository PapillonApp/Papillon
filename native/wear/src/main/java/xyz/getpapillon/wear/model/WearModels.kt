package xyz.getpapillon.wear.model

import org.json.JSONArray
import org.json.JSONObject

data class WearCourseItem(
    val id: String,
    val subject: String,
    val emoji: String,
    val color: String,
    val room: String?,
    val teacher: String?,
    val from: Long,
    val to: Long,
    val statusLabel: String?,
    val isCanceled: Boolean
)

data class WearGradeItem(
    val id: String,
    val subject: String,
    val emoji: String,
    val color: String,
    val description: String,
    val score: String,
    val outOf: String,
    val coefficient: Double,
    val givenAt: Long,
    val isBonus: Boolean
)

data class WearSubjectAverage(
    val id: String,
    val subject: String,
    val emoji: String,
    val color: String,
    val studentAverage: String,
    val classAverage: String?,
    val outOf: String
)

data class WearGradesSummary(
    val periodName: String,
    val overallAverage: String?,
    val classAverage: String?,
    val scale: String,
    val recentGrades: List<WearGradeItem>,
    val subjects: List<WearSubjectAverage>
)

data class WearHomeworkItem(
    val id: String,
    val subject: String,
    val emoji: String,
    val color: String,
    val content: String,
    val dueDate: Long,
    val isDone: Boolean,
    val isEvaluation: Boolean
)

data class WearCanteenCard(
    val id: String,
    val serviceName: String,
    val label: String,
    val amountFormatted: String,
    val lunchRemaining: Int?,
    val qrData: String?,
    val codeType: String,
    val accentColor: String
)

data class WearSyncPayload(
    val version: Int,
    val updatedAt: Long,
    val accountName: String,
    val className: String?,
    val schoolName: String?,
    val accentColor: String,
    val timetable: List<WearCourseItem>,
    val grades: WearGradesSummary,
    val homework: List<WearHomeworkItem>,
    val cards: List<WearCanteenCard>
) {
    fun currentOrNextCourse(nowMs: Long = System.currentTimeMillis()): WearCourseItem? {
        return timetable
            .filter { !it.isCanceled && it.to > nowMs }
            .minByOrNull { it.from }
    }

    companion object {
        fun fromJsonString(raw: String?): WearSyncPayload? {
            if (raw.isNullOrBlank()) return null
            return runCatching {
                val root = JSONObject(raw)
                val timetableJson = root.optJSONArray("timetable") ?: JSONArray()
                val courses = buildList {
                    for (i in 0 until timetableJson.length()) {
                        val item = timetableJson.optJSONObject(i) ?: continue
                        add(
                            WearCourseItem(
                                id = item.optString("id", "course_$i"),
                                subject = item.optString("subject", "Cours"),
                                emoji = item.optString("emoji", "📚"),
                                color = item.optString("color", "#26B290"),
                                room = item.optString("room").takeIf { it.isNotBlank() && it != "null" },
                                teacher = item.optString("teacher").takeIf { it.isNotBlank() && it != "null" },
                                from = item.optLong("from", 0L),
                                to = item.optLong("to", 0L),
                                statusLabel = item.optString("statusLabel").takeIf { it.isNotBlank() && it != "null" },
                                isCanceled = item.optBoolean("isCanceled", false)
                            )
                        )
                    }
                }

                val gradesObj = root.optJSONObject("grades") ?: JSONObject()
                val recentGradesJson = gradesObj.optJSONArray("recentGrades") ?: JSONArray()
                val recentGrades = buildList {
                    for (i in 0 until recentGradesJson.length()) {
                        val g = recentGradesJson.optJSONObject(i) ?: continue
                        add(
                            WearGradeItem(
                                id = g.optString("id", "grade_$i"),
                                subject = g.optString("subject", "Matière"),
                                emoji = g.optString("emoji", "📝"),
                                color = g.optString("color", "#26B290"),
                                description = g.optString("description", ""),
                                score = g.optString("score", "N/A"),
                                outOf = g.optString("outOf", "/20"),
                                coefficient = g.optDouble("coefficient", 1.0),
                                givenAt = g.optLong("givenAt", 0L),
                                isBonus = g.optBoolean("isBonus", false)
                            )
                        )
                    }
                }

                val subjectsJson = gradesObj.optJSONArray("subjects") ?: JSONArray()
                val subjects = buildList {
                    for (i in 0 until subjectsJson.length()) {
                        val s = subjectsJson.optJSONObject(i) ?: continue
                        add(
                            WearSubjectAverage(
                                id = s.optString("id", "sub_$i"),
                                subject = s.optString("subject", "Matière"),
                                emoji = s.optString("emoji", "📘"),
                                color = s.optString("color", "#26B290"),
                                studentAverage = s.optString("studentAverage", "N/A"),
                                classAverage = s.optString("classAverage").takeIf { it.isNotBlank() && it != "null" },
                                outOf = s.optString("outOf", "/20")
                            )
                        )
                    }
                }

                val homeworkJson = root.optJSONArray("homework") ?: JSONArray()
                val homeworks = buildList {
                    for (i in 0 until homeworkJson.length()) {
                        val h = homeworkJson.optJSONObject(i) ?: continue
                        add(
                            WearHomeworkItem(
                                id = h.optString("id", "hw_$i"),
                                subject = h.optString("subject", "Matière"),
                                emoji = h.optString("emoji", "✏️"),
                                color = h.optString("color", "#26B290"),
                                content = h.optString("content", ""),
                                dueDate = h.optLong("dueDate", 0L),
                                isDone = h.optBoolean("isDone", false),
                                isEvaluation = h.optBoolean("isEvaluation", false)
                            )
                        )
                    }
                }

                val cardsJson = root.optJSONArray("cards") ?: JSONArray()
                val cards = buildList {
                    for (i in 0 until cardsJson.length()) {
                        val c = cardsJson.optJSONObject(i) ?: continue
                        val lunchRemaining = if (c.isNull("lunchRemaining")) null else c.optInt("lunchRemaining")
                        add(
                            WearCanteenCard(
                                id = c.optString("id", "card_$i"),
                                serviceName = c.optString("serviceName", "Self"),
                                label = c.optString("label", "Carte"),
                                amountFormatted = c.optString("amountFormatted", "0.00 €"),
                                lunchRemaining = lunchRemaining,
                                qrData = c.optString("qrData").takeIf { it.isNotBlank() && it != "null" },
                                codeType = c.optString("codeType", "QR"),
                                accentColor = c.optString("accentColor", "#26B290")
                            )
                        )
                    }
                }

                WearSyncPayload(
                    version = root.optInt("version", 1),
                    updatedAt = root.optLong("updatedAt", 0L),
                    accountName = root.optString("accountName", "Papillon"),
                    className = root.optString("className").takeIf { it.isNotBlank() && it != "null" },
                    schoolName = root.optString("schoolName").takeIf { it.isNotBlank() && it != "null" },
                    accentColor = root.optString("accentColor", "#26B290"),
                    timetable = courses,
                    grades = WearGradesSummary(
                        periodName = gradesObj.optString("periodName", "Période actuelle"),
                        overallAverage = gradesObj.optString("overallAverage").takeIf { it.isNotBlank() && it != "null" },
                        classAverage = gradesObj.optString("classAverage").takeIf { it.isNotBlank() && it != "null" },
                        scale = gradesObj.optString("scale", "/20"),
                        recentGrades = recentGrades,
                        subjects = subjects
                    ),
                    homework = homeworks,
                    cards = cards
                )
            }.getOrNull()
        }

        fun emptyPlaceholder(): WearSyncPayload {
            return WearSyncPayload(
                version = 1,
                updatedAt = 0L,
                accountName = "Papillon",
                className = null,
                schoolName = "Ouvre Papillon sur ton téléphone pour synchroniser",
                accentColor = "#26B290",
                timetable = emptyList(),
                grades = WearGradesSummary(
                    periodName = "Trimestre 1",
                    overallAverage = null,
                    classAverage = null,
                    scale = "/20",
                    recentGrades = emptyList(),
                    subjects = emptyList()
                ),
                homework = emptyList(),
                cards = emptyList()
            )
        }
    }
}
