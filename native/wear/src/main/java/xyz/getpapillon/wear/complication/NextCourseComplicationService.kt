package xyz.getpapillon.wear.complication

import android.app.PendingIntent
import android.content.Intent
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.LongTextComplicationData
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import xyz.getpapillon.wear.MainActivity
import xyz.getpapillon.wear.data.WearRepository
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class NextCourseComplicationService : SuspendingComplicationDataSourceService() {
    private val timeFormatter = SimpleDateFormat("HH:mm", Locale.getDefault())

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        return when (type) {
            ComplicationType.SHORT_TEXT -> ShortTextComplicationData.Builder(
                text = PlainComplicationText.Builder("Maths").build(),
                contentDescription = PlainComplicationText.Builder("Prochain cours : Maths en B204").build()
            )
                .setTitle(PlainComplicationText.Builder("B204").build())
                .build()

            ComplicationType.LONG_TEXT -> LongTextComplicationData.Builder(
                text = PlainComplicationText.Builder("10:00 • Mathématiques (B204)").build(),
                contentDescription = PlainComplicationText.Builder("Prochain cours : Mathématiques").build()
            )
                .setTitle(PlainComplicationText.Builder("Prochain cours").build())
                .build()

            ComplicationType.RANGED_VALUE -> RangedValueComplicationData.Builder(
                value = 35f,
                min = 0f,
                max = 60f,
                contentDescription = PlainComplicationText.Builder("Progression du cours").build()
            )
                .setText(PlainComplicationText.Builder("Maths").build())
                .setTitle(PlainComplicationText.Builder("B204").build())
                .build()

            else -> null
        }
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        val payload = WearRepository.ensureLoaded(applicationContext)
        val now = System.currentTimeMillis()
        val course = payload.currentOrNextCourse(now)

        val launchIntent = Intent(applicationContext, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val tapAction = PendingIntent.getActivity(
            applicationContext,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        if (course == null) {
            return when (request.complicationType) {
                ComplicationType.SHORT_TEXT -> ShortTextComplicationData.Builder(
                    text = PlainComplicationText.Builder("Libre").build(),
                    contentDescription = PlainComplicationText.Builder("Aucun cours à venir").build()
                )
                    .setTitle(PlainComplicationText.Builder("Papillon").build())
                    .setTapAction(tapAction)
                    .build()

                ComplicationType.LONG_TEXT -> LongTextComplicationData.Builder(
                    text = PlainComplicationText.Builder("Aucun cours à venir").build(),
                    contentDescription = PlainComplicationText.Builder("Aucun cours à venir").build()
                )
                    .setTitle(PlainComplicationText.Builder("Papillon").build())
                    .setTapAction(tapAction)
                    .build()

                ComplicationType.RANGED_VALUE -> RangedValueComplicationData.Builder(
                    value = 0f,
                    min = 0f,
                    max = 100f,
                    contentDescription = PlainComplicationText.Builder("Aucun cours").build()
                )
                    .setText(PlainComplicationText.Builder("Libre").build())
                    .setTapAction(tapAction)
                    .build()

                else -> null
            }
        }

        val shortSubject = course.subject.take(10)
        val startStr = timeFormatter.format(Date(course.from))
        val roomOrTime = course.room ?: startStr

        return when (request.complicationType) {
            ComplicationType.SHORT_TEXT -> ShortTextComplicationData.Builder(
                text = PlainComplicationText.Builder(shortSubject).build(),
                contentDescription = PlainComplicationText.Builder("${course.subject} ($roomOrTime)").build()
            )
                .setTitle(PlainComplicationText.Builder(roomOrTime.take(7)).build())
                .setTapAction(tapAction)
                .build()

            ComplicationType.LONG_TEXT -> LongTextComplicationData.Builder(
                text = PlainComplicationText.Builder(
                    "$startStr • ${course.subject}${course.room?.let { " ($it)" } ?: ""}"
                ).build(),
                contentDescription = PlainComplicationText.Builder(course.subject).build()
            )
                .setTitle(
                    PlainComplicationText.Builder(
                        if (course.from <= now) "En cours" else "Prochain cours"
                    ).build()
                )
                .setTapAction(tapAction)
                .build()

            ComplicationType.RANGED_VALUE -> {
                val duration = (course.to - course.from).coerceAtLeast(1L).toFloat()
                val elapsed = (now - course.from).coerceIn(0L, course.to - course.from).toFloat()
                RangedValueComplicationData.Builder(
                    value = elapsed,
                    min = 0f,
                    max = duration,
                    contentDescription = PlainComplicationText.Builder(course.subject).build()
                )
                    .setText(PlainComplicationText.Builder(shortSubject).build())
                    .setTitle(PlainComplicationText.Builder(roomOrTime.take(7)).build())
                    .setTapAction(tapAction)
                    .build()
            }

            else -> null
        }
    }
}
