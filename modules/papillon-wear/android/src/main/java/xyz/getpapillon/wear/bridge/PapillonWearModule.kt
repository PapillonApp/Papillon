package xyz.getpapillon.wear.bridge

import android.content.Context
import androidx.core.os.bundleOf
import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.nio.charset.StandardCharsets

class PapillonWearModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PapillonWear")

    Events("onWatchSyncRequested", "onWatchToggleHomework")

    OnCreate {
      activeInstance = this@PapillonWearModule
    }

    OnDestroy {
      if (activeInstance === this@PapillonWearModule) {
        activeInstance = null
      }
    }

    Property("isSupported") {
      true
    }

    AsyncFunction("syncWatchData") { payloadJson: String ->
      val context = appContext.reactContext ?: return@AsyncFunction false
      return@AsyncFunction publishSyncPayload(context, payloadJson)
    }

    AsyncFunction("getConnectedWatches") {
      val context = appContext.reactContext ?: return@AsyncFunction emptyList<Map<String, Any>>()
      return@AsyncFunction try {
        val nodes = Tasks.await(Wearable.getNodeClient(context).connectedNodes)
        nodes.map { node ->
          mapOf(
            "id" to node.id,
            "displayName" to node.displayName,
            "isNearby" to node.isNearby
          )
        }
      } catch (_: Exception) {
        emptyList<Map<String, Any>>()
      }
    }

    AsyncFunction("pingWatches") {
      val context = appContext.reactContext ?: return@AsyncFunction 0
      return@AsyncFunction try {
        val nodes = Tasks.await(Wearable.getNodeClient(context).connectedNodes)
        val messageClient = Wearable.getMessageClient(context)
        val payloadBytes = "ping".toByteArray(StandardCharsets.UTF_8)
        var sentCount = 0
        for (node in nodes) {
          Tasks.await(messageClient.sendMessage(node.id, PATH_PING, payloadBytes))
          sentCount++
        }
        sentCount
      } catch (_: Exception) {
        0
      }
    }
  }

  internal fun emitWatchSyncRequested() {
    sendEvent("onWatchSyncRequested", bundleOf("timestamp" to System.currentTimeMillis()))
  }

  internal fun emitWatchToggleHomework(homeworkId: String, isDone: Boolean) {
    sendEvent(
      "onWatchToggleHomework",
      bundleOf(
        "homeworkId" to homeworkId,
        "isDone" to isDone
      )
    )
  }

  companion object {
    const val PATH_SYNC_DATA = "/papillon/sync"
    const val PATH_SYNC_PUSH = "/papillon/sync_push"
    const val PATH_REQUEST_SYNC = "/papillon/request_sync"
    const val PATH_TOGGLE_HOMEWORK = "/papillon/toggle_homework"
    const val PATH_PING = "/papillon/ping"
    private const val PREFS_NAME = "papillon_wear_bridge_cache"
    private const val KEY_LAST_PAYLOAD = "last_payload_json"

    @Volatile
    var activeInstance: PapillonWearModule? = null

    fun publishSyncPayload(context: Context, payloadJson: String): Boolean {
      return try {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
          .edit()
          .putString(KEY_LAST_PAYLOAD, payloadJson)
          .apply()

        val putDataMapRequest = PutDataMapRequest.create(PATH_SYNC_DATA).apply {
          dataMap.putString("payload", payloadJson)
          dataMap.putLong("updatedAt", System.currentTimeMillis())
        }
        val putDataRequest = putDataMapRequest.asPutDataRequest().setUrgent()
        Tasks.await(Wearable.getDataClient(context).putDataItem(putDataRequest))

        val nodes = Tasks.await(Wearable.getNodeClient(context).connectedNodes)
        val messageClient = Wearable.getMessageClient(context)
        val payloadBytes = payloadJson.toByteArray(StandardCharsets.UTF_8)
        for (node in nodes) {
          runCatching {
            Tasks.await(messageClient.sendMessage(node.id, PATH_SYNC_PUSH, payloadBytes))
          }
        }
        true
      } catch (_: Exception) {
        false
      }
    }

    fun republishCachedPayload(context: Context): Boolean {
      val cached = context
        .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        .getString(KEY_LAST_PAYLOAD, null) ?: return false
      return publishSyncPayload(context, cached)
    }
  }
}
