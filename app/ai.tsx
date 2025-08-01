import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite'

// 1) Tes deux modèles exportés
const MODELS = {
  fp32: require('../assets/model/model_fp32.tflite'),
  dynamic: require('../assets/model/model_dynamic.tflite'),
} as const

// 2) Tes JSON tokenizer / labels / dataset
const TOKENIZER: { word_index: Record<string, number>; oov_token: string } =
  require('../assets/model/tokenizer.json')
const LABELS: string[] = require('../assets/model/label_classes.json')
const DATASET: Array<{ description: string; type: string }> = require(
  '../assets/model/datasets.json'
)

// 3) On ne change que le fichier TFLite, l’input reste toujours int32
type ModelKey = keyof typeof MODELS

export default function PredictScreen() {
  const [model, setModel] = useState<TensorflowModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [variant, setVariant] = useState<ModelKey>('fp32')
  const [maxLen, setMaxLen] = useState(30)
  const [results, setResults] = useState<any[]>([])

  // 4) Déduire l’index OOV depuis le tokenizer JSON
  const OOV_INDEX =
    TOKENIZER.word_index[TOKENIZER.oov_token] ??
    /* fallback */ 1

  // nettoyage à l’identique de ton trainer Python
  function cleanText(t: string): string {
    return t
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/<.*?>/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .toLowerCase()
  }

  // 5) Tokenizer Keras-like + padding
  function tokenize(text: string, len: number): number[] {
    const words = cleanText(text).trim().split(/\s+/)
    const seq: number[] = []
    for (const w of words) {
      seq.push(TOKENIZER.word_index[w] ?? OOV_INDEX)
      if (seq.length >= len) { break }
    }
    while (seq.length < len) { seq.push(0) }
    return seq
  }

  // 6) On ne fait QUE des Int32Array
  function makeInt32Input(data: number[]) {
    return new Int32Array(data)
  }

  // Chargement du modèle à chaque changement de variante
  useEffect(() => {
    setLoading(true)
    setModel(null)
    loadTensorflowModel(MODELS[variant])
      .then(m => {
        console.log('📦 Model loaded:', variant)
        setModel(m)
        const shape = m.inputs[0].shape
        if (shape && shape[1]) { setMaxLen(shape[1]) }
      })
      .catch(e => console.warn('❌ Load error:', e))
      .finally(() => setLoading(false))
  }, [variant])

  // 7) Inference
  const runInference = async (
    sample: { description: string; type: string },
    idx: number
  ) => {
    if (!model) { return }
    console.log(`\n🛠️ Test #${idx + 1}`, sample.description)

    const seq = tokenize(sample.description, maxLen)
    console.log('🔤 Seq:', seq.slice(0, 8), '…')

    const inputArr = makeInt32Input(seq)
    console.log('📏 Input len/type:', inputArr.length, 'int32')

    const inputTensor = {
      name: model.inputs[0].name,
      dataType: 'int32' as const,
      shape: [1, maxLen],
      data: inputArr,
    }
    console.log('🧪 Input tensor:', inputTensor)

    try {
      const [out] = await model.run([inputTensor])
      console.log('✅ Raw output:', out)

      const scores = Array.from(out as Float32Array)
      const best = scores.indexOf(Math.max(...scores))
      const pred = LABELS[best] ?? `#${best}`
      console.log(`🤖 Predicted: ${pred}`)

      setResults(r => [
        ...r,
        { ...sample, predicted: pred, scores },
      ])
    } catch (e: any) {
      console.warn('❌ Inference error:', e.message || e)
      setResults(r => [...r, { ...sample, error: e.message || e }])
    }
  }

  // 8) Lancer plusieurs exemples au hasard
  const testSamples = (count: number) => {
    setResults([])
    const valid = DATASET.filter(d => d.type)
    const pick = valid.sort(() => 0.5 - Math.random()).slice(0, count)
    pick.forEach((s, i) => runInference(s, i))
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading {variant} model…</Text>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.center}>
      <Text style={styles.title}>🧪 TFLite Demo</Text>

      {/* Sélection du modèle */}
      <View style={styles.buttonRow}>
        {(['fp32', 'dynamic'] as ModelKey[]).map(v => (
          <Button
            key={v}
            title={v}
            onPress={() => setVariant(v)}
            color={variant === v ? 'blue' : 'gray'}
          />
        ))}
      </View>

      {/* Commandes de tests */}
      <View style={styles.buttonRow}>
        <Button title="Test 5" onPress={() => testSamples(5)} />
        <Button title="Test 20" onPress={() => testSamples(20)} />
        <Button title="Test 100" onPress={() => testSamples(100)} />
      </View>

      {/* Résultats */}
      {results.map((r, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.text}>
            #{i + 1} {r.description.slice(0, 40)}…
          </Text>
          {r.error ? (
            <Text style={[styles.text, { color: 'red' }]}>
              Error: {r.error}
            </Text>
          ) : (
            <>
              <Text style={styles.text}>Expected: {r.type}</Text>
              <Text style={styles.text}>
                Predicted: {r.predicted}
              </Text>
              <Text style={styles.text}>
                Scores: {r.scores.map((s: number) => s.toFixed(3)).join(', ')}
              </Text>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 8,
  },
  card: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 4,
    borderRadius: 6,
  },
  text: {
    textAlign: 'center',
  },
})
