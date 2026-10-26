package xyz.getpapillon.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import xyz.getpapillon.wear.data.WearRepository
import xyz.getpapillon.wear.ui.screens.CanteenCardScreen
import xyz.getpapillon.wear.ui.screens.GradesScreen
import xyz.getpapillon.wear.ui.screens.HomeScreen
import xyz.getpapillon.wear.ui.screens.HomeworkScreen
import xyz.getpapillon.wear.ui.screens.TimetableScreen
import xyz.getpapillon.wear.ui.theme.PapillonWearTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WearRepository.ensureLoaded(applicationContext)

        setContent {
            val payload by WearRepository.payload.collectAsState()
            val navController = rememberSwipeDismissableNavController()

            PapillonWearTheme(accentHex = payload.accentColor) {
                SwipeDismissableNavHost(
                    navController = navController,
                    startDestination = "home"
                ) {
                    composable("home") {
                        HomeScreen(
                            payload = payload,
                            onOpenTimetable = { navController.navigate("timetable") },
                            onOpenGrades = { navController.navigate("grades") },
                            onOpenHomework = { navController.navigate("homework") },
                            onOpenCards = { navController.navigate("cards") },
                            onRequestSync = {
                                WearRepository.requestSyncFromPhone(applicationContext)
                            }
                        )
                    }

                    composable("timetable") {
                        TimetableScreen(
                            courses = payload.timetable,
                            accentHex = payload.accentColor
                        )
                    }

                    composable("grades") {
                        GradesScreen(
                            grades = payload.grades,
                            accentHex = payload.accentColor
                        )
                    }

                    composable("homework") {
                        HomeworkScreen(
                            homeworks = payload.homework,
                            accentHex = payload.accentColor,
                            onToggleHomework = { homeworkId, isDone ->
                                WearRepository.toggleHomeworkOnPhone(
                                    applicationContext,
                                    homeworkId,
                                    isDone
                                )
                            }
                        )
                    }

                    composable("cards") {
                        CanteenCardScreen(
                            cards = payload.cards,
                            accentHex = payload.accentColor
                        )
                    }
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        WearRepository.pullFromDataLayer(applicationContext)
    }
}
