import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, ScrollView, StyleSheet } from 'react-native';
import ModelManager, { TestResult } from '@/utils/magic/ModelManager';
import { log, error as logError } from '@/utils/logger/logger';

export default function AIScreen() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        log('[INIT] Loading model and tokenizer...');
        await ModelManager.loadModel();
        await ModelManager.loadTokenizer();
        setLoading(false);
        log('[INIT] Model and tokenizer loaded.');
      } catch (err: any) {
        logError('[INIT ERROR]', err);
        setErrorMsg('Failed to load model or tokenizer.');
        setLoading(false);
      }
    })();
  }, []);

  const handlePredict = async () => {
    if (!input.trim()) { return; }
    setResult(null);
    setErrorMsg(null);
    try {
      const prediction = await ModelManager.predict(input);
      setResult(prediction);
    } catch (err: unknown) {
      logError('[PREDICT ERROR]', err as string);
      setErrorMsg('Prediction failed.');
    }
  };

  const handleTest = async (numSamples: number) => {
    setTesting(true);
    setTestResult(null);
    setErrorMsg(null);
    try {
      log(`[TEST] Starting test with ${numSamples} samples...`);
      const result = await ModelManager.testModel(numSamples);
      setTestResult(result);
      log(`[TEST] Test completed - Accuracy: ${result.accuracy.toFixed(1)}%`);
    } catch (err: unknown) {
      logError('[TEST ERROR]', err as string);
      setErrorMsg('Test failed.');
    }
    setTesting(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Chargement du modèle...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.centered}>
      <Text style={styles.title}>🧠 Prédiction d&apos;un devoir</Text>
      <TextInput
        style={styles.input}
        placeholder="Écris ici ton devoir..."
        value={input}
        onChangeText={setInput}
      />
      <Button title="Prédire" onPress={handlePredict} />

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>🔍 Prédiction: {result.predicted}</Text>
          <Text style={styles.resultText}>📊 Probabilités par label:</Text>
          {Object.entries(result.labelScores || {})
            .sort(([, a], [, b]) => (b as number) - (a as number)) // Trier par probabilité décroissante
            .map(([label, score]) => (
              <Text key={label} style={[
                styles.labelScoreText,
                label === result.predicted ? styles.predictedLabel : {}
              ]}>
                {label === result.predicted ? '🎯 ' : '   '}{label}: {((score as number) * 100).toFixed(2)}%
              </Text>
            ))}
        </View>
      )}

      <View style={styles.testSection}>
        <Text style={styles.sectionTitle}>🧪 Test du modèle</Text>
        <Text style={styles.description}>
          Testez la précision du modèle avec des échantillons du dataset
        </Text>


        <View style={styles.buttonRow}>
          <Button
            title="Test 5"
            onPress={() => handleTest(5)}
            disabled={testing}
          />
          <Button
            title="Test 20"
            onPress={() => handleTest(20)}
            disabled={testing}
          />
          <Button
            title="Test 100"
            onPress={() => handleTest(100)}
            disabled={testing}
          />
        </View>

        {testing && (
          <Text style={styles.loadingText}>Test en cours...</Text>
        )}

        {testResult && (
          <View style={styles.testResultBox}>
            <Text style={styles.testResultTitle}>
              📈 Résultats du test ({testResult.total} échantillons)
            </Text>
            <Text style={styles.accuracyText}>
              Précision: {testResult.accuracy.toFixed(1)}% ({testResult.correct}/{testResult.total})
            </Text>

            <Text style={styles.detailsTitle}>Détails des erreurs:</Text>
            <ScrollView style={styles.detailsScroll} nestedScrollEnabled>
              {testResult.details
                .filter(detail => !detail.correct)
                .slice(0, 10) // Limite à 10 pour éviter la surcharge
                .map((detail, index) => (
                  <View key={index} style={styles.errorDetail}>
                    <Text style={styles.errorText}>
                      ❌ &quot;{detail.description.slice(0, 60)}...&quot;
                    </Text>
                    <Text style={styles.errorPrediction}>
                      Attendu: {detail.expected || 'null'} | Prédit: {detail.predicted}
                    </Text>
                  </View>
                ))}
            </ScrollView>
          </View>
        )}
      </View>

      {errorMsg && <Text style={{ color: 'red', marginTop: 10 }}>{errorMsg}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  resultBox: {
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  labelScoreText: {
    fontSize: 14,
    marginBottom: 2,
    textAlign: 'left',
    fontFamily: 'monospace',
  },
  predictedLabel: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  testSection: {
    marginTop: 30,
    width: '100%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  loadingText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
  },
  testResultBox: {
    marginTop: 15,
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
  },
  testResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  accuracyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2e7d32',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsScroll: {
    maxHeight: 200,
  },
  errorDetail: {
    backgroundColor: '#ffebee',
    padding: 8,
    marginBottom: 5,
    borderRadius: 4,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 3,
  },
  errorPrediction: {
    fontSize: 11,
    color: '#666',
  },
});