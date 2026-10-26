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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.Card
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.PositionIndicator
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.material.Vignette
import androidx.wear.compose.material.VignettePosition
import xyz.getpapillon.wear.model.WearSyncPayload
import xyz.getpapillon.wear.ui.theme.parseHexColor
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun HomeScreen(
    payload: WearSyncPayload,
    onOpenTimetable: () -> Unit,
    onOpenGrades: () -> Unit,
    onOpenHomework: () -> Unit,
    onOpenCards: () -> Unit,
    onRequestSync: () -> Unit
) {
    val listState = rememberScalingLazyListState()
    val accentColor = parseHexColor(payload.accentColor)
    val now = System.currentTimeMillis()
    val nextCourse = payload.currentOrNextCourse(now)
    val pendingHomeworkCount = payload.homework.count { !it.isDone }
    val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())

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
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(top = 18.dp, bottom = 2.dp)
                ) {
                    Text(
                        text = "🦋 ${payload.accountName}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = accentColor,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (!payload.className.isNullOrBlank()) {
                        Text(
                            text = payload.className,
                            fontSize = 11.sp,
                            color = MaterialTheme.colors.onSurfaceVariant,
                            maxLines = 1
                        )
                    }
                }
            }

            item {
                Card(
                    onClick = onOpenTimetable,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (nextCourse != null) {
                        val courseColor = parseHexColor(nextCourse.color, accentColor)
                        val isOngoing = nextCourse.from <= now && nextCourse.to > now
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(courseColor)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isOngoing) "EN COURS" else "PROCHAIN COURS",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = courseColor
                            )
                        }
                        Spacer(modifier = Modifier.height(3.dp))
                        Text(
                            text = "${nextCourse.emoji} ${nextCourse.subject}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = buildString {
                                append("${timeFormat.format(Date(nextCourse.from))} - ${timeFormat.format(Date(nextCourse.to))}")
                                if (!nextCourse.room.isNullOrBlank()) {
                                    append(" • ${nextCourse.room}")
                                }
                            },
                            fontSize = 11.sp,
                            color = MaterialTheme.colors.onSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    } else {
                        Text(
                            text = "Emploi du temps",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "Aucun cours à venir aujourd'hui",
                            fontSize = 11.sp,
                            color = MaterialTheme.colors.onSurfaceVariant
                        )
                    }
                }
            }

            item {
                Chip(
                    onClick = onOpenTimetable,
                    modifier = Modifier.fillMaxWidth(),
                    label = {
                        Text(
                            text = "📅 Emploi du temps",
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    },
                    secondaryLabel = {
                        Text(
                            text = "${payload.timetable.size} cours synchronisés",
                            fontSize = 11.sp
                        )
                    },
                    colors = ChipDefaults.secondaryChipColors()
                )
            }

            item {
                Chip(
                    onClick = onOpenGrades,
                    modifier = Modifier.fillMaxWidth(),
                    label = {
                        Text(
                            text = "🎓 Notes & Moyennes",
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    },
                    secondaryLabel = {
                        val avg = payload.grades.overallAverage
                        Text(
                            text = if (avg != null) {
                                "Moy. ${avg}${payload.grades.scale} • ${payload.grades.recentGrades.size} notes"
                            } else {
                                "${payload.grades.recentGrades.size} dernières notes"
                            },
                            fontSize = 11.sp
                        )
                    },
                    colors = ChipDefaults.secondaryChipColors()
                )
            }

            item {
                Chip(
                    onClick = onOpenHomework,
                    modifier = Modifier.fillMaxWidth(),
                    label = {
                        Text(
                            text = "📚 Devoirs",
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    },
                    secondaryLabel = {
                        Text(
                            text = if (pendingHomeworkCount > 0) {
                                "$pendingHomeworkCount à faire"
                            } else {
                                "Tout est fait !"
                            },
                            fontSize = 11.sp
                        )
                    },
                    colors = ChipDefaults.secondaryChipColors()
                )
            }

            item {
                Chip(
                    onClick = onOpenCards,
                    modifier = Modifier.fillMaxWidth(),
                    label = {
                        Text(
                            text = "🍽️ Carte de self",
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    },
                    secondaryLabel = {
                        val firstCard = payload.cards.firstOrNull()
                        Text(
                            text = firstCard?.let { "${it.serviceName} • ${it.amountFormatted}" }
                                ?: "QR code & solde",
                            fontSize = 11.sp
                        )
                    },
                    colors = ChipDefaults.secondaryChipColors()
                )
            }

            item {
                Chip(
                    onClick = onRequestSync,
                    modifier = Modifier.fillMaxWidth(),
                    label = {
                        Text(
                            text = "🔄 Synchroniser",
                            textAlign = TextAlign.Center
                        )
                    },
                    secondaryLabel = {
                        val sub = if (payload.updatedAt > 0L) {
                            "Mis à jour à ${timeFormat.format(Date(payload.updatedAt))}"
                        } else {
                            "En attente du téléphone"
                        }
                        Text(text = sub, fontSize = 10.sp)
                    },
                    colors = ChipDefaults.primaryChipColors(
                        backgroundColor = accentColor,
                        contentColor = Color.Black
                    )
                )
            }
        }
    }
}
