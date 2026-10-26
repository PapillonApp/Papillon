package xyz.getpapillon.wear.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.Card
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.PositionIndicator
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.material.Vignette
import androidx.wear.compose.material.VignettePosition
import xyz.getpapillon.wear.model.WearCourseItem
import xyz.getpapillon.wear.ui.theme.parseHexColor
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun TimetableScreen(
    courses: List<WearCourseItem>,
    accentHex: String
) {
    val listState = rememberScalingLazyListState()
    val accentColor = parseHexColor(accentHex)
    val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
    val dayFormat = SimpleDateFormat("EEE d MMM", Locale.getDefault())

    Scaffold(
        timeText = { TimeText() },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) }
    ) {
        ScalingLazyColumn(
            modifier = Modifier.fillMaxSize(),
            state = listState,
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            item {
                Text(
                    text = "📅 Emploi du temps",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = accentColor,
                    modifier = Modifier.padding(top = 18.dp, bottom = 4.dp)
                )
            }

            if (courses.isEmpty()) {
                item {
                    Text(
                        text = "Aucun cours à venir",
                        fontSize = 12.sp,
                        color = MaterialTheme.colors.onSurfaceVariant,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            } else {
                items(courses, key = { it.id }) { course ->
                    val subjectColor = parseHexColor(course.color, accentColor)
                    val timeRange = "${timeFormat.format(Date(course.from))} – ${timeFormat.format(Date(course.to))}"
                    val dayText = dayFormat.format(Date(course.from))

                    Card(
                        onClick = {},
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Box(
                                modifier = Modifier
                                    .width(4.dp)
                                    .height(38.dp)
                                    .clip(RoundedCornerShape(2.dp))
                                    .background(if (course.isCanceled) Color(0xFFFF5252) else subjectColor)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "${course.emoji} ${course.subject}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (course.isCanceled) Color(0xFFFF8A80) else Color.White,
                                    textDecoration = if (course.isCanceled) TextDecoration.LineThrough else TextDecoration.None,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = "$dayText • $timeRange",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colors.onSurfaceVariant,
                                    maxLines = 1
                                )
                                val details = listOfNotNull(
                                    course.room?.let { "Salle $it" },
                                    course.teacher
                                ).joinToString(" • ")
                                if (details.isNotBlank()) {
                                    Text(
                                        text = details,
                                        fontSize = 11.sp,
                                        color = subjectColor,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                                if (!course.statusLabel.isNullOrBlank()) {
                                    Text(
                                        text = course.statusLabel,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (course.isCanceled) Color(0xFFFF5252) else Color(0xFFFFD54F)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
