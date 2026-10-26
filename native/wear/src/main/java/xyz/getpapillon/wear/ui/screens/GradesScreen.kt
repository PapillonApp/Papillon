package xyz.getpapillon.wear.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
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
import xyz.getpapillon.wear.model.WearGradesSummary
import xyz.getpapillon.wear.ui.theme.parseHexColor
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun GradesScreen(
    grades: WearGradesSummary,
    accentHex: String
) {
    val listState = rememberScalingLazyListState()
    val accentColor = parseHexColor(accentHex)
    var showSubjects by remember { mutableStateOf(false) }
    val dateFormat = SimpleDateFormat("dd/MM", Locale.getDefault())

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
                        text = "🎓 Notes",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = accentColor
                    )
                    Text(
                        text = grades.periodName,
                        fontSize = 11.sp,
                        color = MaterialTheme.colors.onSurfaceVariant,
                        maxLines = 1
                    )
                }
            }

            item {
                Card(
                    onClick = { showSubjects = !showSubjects },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Moyenne générale",
                                fontSize = 10.sp,
                                color = MaterialTheme.colors.onSurfaceVariant
                            )
                            Text(
                                text = grades.overallAverage?.let { "$it${grades.scale}" } ?: "N/A",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = accentColor
                            )
                        }
                        if (grades.classAverage != null) {
                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "Classe",
                                    fontSize = 10.sp,
                                    color = MaterialTheme.colors.onSurfaceVariant
                                )
                                Text(
                                    text = "${grades.classAverage}${grades.scale}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color.White
                                )
                            }
                        }
                    }
                }
            }

            item {
                Chip(
                    onClick = { showSubjects = !showSubjects },
                    modifier = Modifier.fillMaxWidth(),
                    label = {
                        Text(
                            text = if (showSubjects) "Voir les dernières notes" else "Voir par matière (${grades.subjects.size})",
                            fontSize = 11.sp,
                            maxLines = 1
                        )
                    },
                    colors = ChipDefaults.secondaryChipColors()
                )
            }

            if (showSubjects) {
                items(grades.subjects, key = { it.id }) { subject ->
                    val subjectColor = parseHexColor(subject.color, accentColor)
                    Card(
                        onClick = {},
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "${subject.emoji} ${subject.subject}",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                if (subject.classAverage != null) {
                                    Text(
                                        text = "Classe : ${subject.classAverage}${subject.outOf}",
                                        fontSize = 10.sp,
                                        color = MaterialTheme.colors.onSurfaceVariant
                                    )
                                }
                            }
                            Text(
                                text = "${subject.studentAverage}${subject.outOf}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = subjectColor
                            )
                        }
                    }
                }
            } else {
                if (grades.recentGrades.isEmpty()) {
                    item {
                        Text(
                            text = "Aucune note récente",
                            fontSize = 12.sp,
                            color = MaterialTheme.colors.onSurfaceVariant,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                } else {
                    items(grades.recentGrades, key = { it.id }) { item ->
                        val subjectColor = parseHexColor(item.color, accentColor)
                        Card(
                            onClick = {},
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "${item.emoji} ${item.subject}",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = subjectColor,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = item.description,
                                        fontSize = 11.sp,
                                        color = Color.White,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    val meta = buildString {
                                        if (item.givenAt > 0L) {
                                            append(dateFormat.format(Date(item.givenAt)))
                                            append(" • ")
                                        }
                                        append("Coef. ${item.coefficient}")
                                        if (item.isBonus) {
                                            append(" • Bonus")
                                        }
                                    }
                                    Text(
                                        text = meta,
                                        fontSize = 10.sp,
                                        color = MaterialTheme.colors.onSurfaceVariant
                                    )
                                }
                                Text(
                                    text = "${item.score}${item.outOf}",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
