package xyz.getpapillon.wear.tile

import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.ColorBuilders.argb
import androidx.wear.protolayout.DimensionBuilders.dp
import androidx.wear.protolayout.DimensionBuilders.sp
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import xyz.getpapillon.wear.MainActivity
import xyz.getpapillon.wear.data.WearRepository
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class NextCourseTileService : TileService() {
    private val timeFormatter = SimpleDateFormat("HH:mm", Locale.getDefault())

    override fun onTileRequest(
        requestParams: RequestBuilders.TileRequest
    ): ListenableFuture<TileBuilders.Tile> {
        val payload = WearRepository.ensureLoaded(applicationContext)
        val now = System.currentTimeMillis()
        val nextCourse = payload.currentOrNextCourse(now)

        val launchClickable = ModifiersBuilders.Clickable.Builder()
            .setId("open_papillon_wear")
            .setOnClick(
                ActionBuilders.LaunchAction.Builder()
                    .setAndroidActivity(
                        ActionBuilders.AndroidActivity.Builder()
                            .setPackageName(packageName)
                            .setClassName(MainActivity::class.java.name)
                            .build()
                    )
                    .build()
            )
            .build()

        val rootColumn = LayoutElementBuilders.Column.Builder()
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setClickable(launchClickable)
                    .setPadding(
                        ModifiersBuilders.Padding.Builder()
                            .setAll(dp(14f))
                            .build()
                    )
                    .build()
            )
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)

        if (nextCourse != null) {
            val isOngoing = nextCourse.from <= now && nextCourse.to > now
            val headerLabel = if (isOngoing) "EN COURS" else "PROCHAIN COURS"
            val hoursText = "${timeFormatter.format(Date(nextCourse.from))} – ${timeFormatter.format(Date(nextCourse.to))}"
            val roomText = nextCourse.room?.let { "Salle $it" } ?: (nextCourse.teacher ?: "")

            rootColumn
                .addContent(
                    LayoutElementBuilders.Text.Builder()
                        .setText(headerLabel)
                        .setFontStyle(
                            LayoutElementBuilders.FontStyle.Builder()
                                .setSize(sp(10f))
                                .setColor(argb(0xFF26B290.toInt()))
                                .setWeight(LayoutElementBuilders.FONT_WEIGHT_BOLD)
                                .build()
                        )
                        .build()
                )
                .addContent(
                    LayoutElementBuilders.Spacer.Builder().setHeight(dp(4f)).build()
                )
                .addContent(
                    LayoutElementBuilders.Text.Builder()
                        .setText("${nextCourse.emoji} ${nextCourse.subject}")
                        .setMaxLines(2)
                        .setFontStyle(
                            LayoutElementBuilders.FontStyle.Builder()
                                .setSize(sp(15f))
                                .setColor(argb(0xFFFFFFFF.toInt()))
                                .setWeight(LayoutElementBuilders.FONT_WEIGHT_BOLD)
                                .build()
                        )
                        .build()
                )
                .addContent(
                    LayoutElementBuilders.Spacer.Builder().setHeight(dp(4f)).build()
                )
                .addContent(
                    LayoutElementBuilders.Text.Builder()
                        .setText(hoursText)
                        .setFontStyle(
                            LayoutElementBuilders.FontStyle.Builder()
                                .setSize(sp(12f))
                                .setColor(argb(0xFFB0BEC5.toInt()))
                                .build()
                        )
                        .build()
                )

            if (roomText.isNotBlank()) {
                rootColumn
                    .addContent(
                        LayoutElementBuilders.Spacer.Builder().setHeight(dp(2f)).build()
                    )
                    .addContent(
                        LayoutElementBuilders.Text.Builder()
                            .setText(roomText)
                            .setFontStyle(
                                LayoutElementBuilders.FontStyle.Builder()
                                    .setSize(sp(12f))
                                    .setColor(argb(0xFF26B290.toInt()))
                                    .setWeight(LayoutElementBuilders.FONT_WEIGHT_MEDIUM)
                                    .build()
                            )
                            .build()
                    )
            }
        } else {
            rootColumn
                .addContent(
                    LayoutElementBuilders.Text.Builder()
                        .setText("🦋 Papillon")
                        .setFontStyle(
                            LayoutElementBuilders.FontStyle.Builder()
                                .setSize(sp(14f))
                                .setColor(argb(0xFF26B290.toInt()))
                                .setWeight(LayoutElementBuilders.FONT_WEIGHT_BOLD)
                                .build()
                        )
                        .build()
                )
                .addContent(
                    LayoutElementBuilders.Spacer.Builder().setHeight(dp(6f)).build()
                )
                .addContent(
                    LayoutElementBuilders.Text.Builder()
                        .setText("Aucun cours à venir")
                        .setFontStyle(
                            LayoutElementBuilders.FontStyle.Builder()
                                .setSize(sp(13f))
                                .setColor(argb(0xFFFFFFFF.toInt()))
                                .build()
                        )
                        .build()
                )
        }

        val layout = LayoutElementBuilders.Layout.Builder()
            .setRoot(
                LayoutElementBuilders.Box.Builder()
                    .addContent(rootColumn.build())
                    .build()
            )
            .build()

        val timeline = TimelineBuilders.Timeline.Builder()
            .addTimelineEntry(
                TimelineBuilders.TimelineEntry.Builder()
                    .setLayout(layout)
                    .build()
            )
            .build()

        val tile = TileBuilders.Tile.Builder()
            .setResourcesVersion(RESOURCES_VERSION)
            .setFreshnessIntervalMillis(5 * 60 * 1000L)
            .setTileTimeline(timeline)
            .build()

        return Futures.immediateFuture(tile)
    }

    override fun onTileResourcesRequest(
        requestParams: RequestBuilders.ResourcesRequest
    ): ListenableFuture<ResourceBuilders.Resources> {
        return Futures.immediateFuture(
            ResourceBuilders.Resources.Builder()
                .setVersion(RESOURCES_VERSION)
                .build()
        )
    }

    companion object {
        private const val RESOURCES_VERSION = "1"
    }
}
