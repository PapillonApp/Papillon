import { Papicons } from '@getpapillon/papicons';
import React from 'react';

import Icon from '@/ui/components/Icon';
import Stack from '@/ui/components/Stack';
import List from '@/ui/new/List';
import Typography from '@/ui/new/Typography';
import adjust from '@/utils/adjustColor';
import { Modal, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@react-navigation/native';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import { Dynamic } from '@/ui/components/Dynamic';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { GradeDisplayScale, formatAssumed20ForDisplay } from '@/utils/grades/scale';

export interface AveragedElement {
  id: number;
  coef: number;
  moyenne: string;
}

export interface UEMoyenne {
  value: string;
  min: string;
  max: string;
  moy: string;
  rang: string;
  total: number;
  groupes: Record<string, any>; // Currently empty in your data
}

export interface ECTSInfo {
  acquis: number;
  total: number;
}

export interface UE {
  id: number;
  titre: string;
  numero: number;
  type: number;
  color: string;
  competence: string | null;
  moyenne: UEMoyenne;
  bonus: string;
  malus: string;
  capitalise: boolean | null;
  ressources: Record<string, AveragedElement>;
  saes: Record<string, AveragedElement>;
  ECTS: ECTSInfo;
}

export type UEMap = Record<string, UE>;

const ScodocUES: React.FC<{ data: UEMap, displayScale: GradeDisplayScale }> = ({ data, displayScale }) => {
  try {
    const { colors } = useTheme();
    const [openedUE, setOpenedUE] = React.useState<string | null>(null);
    const [displayUEs, setDisplayUEs] = React.useState(false);
    const scaleDenominator = formatAssumed20ForDisplay(0, displayScale).denominator;
    const toDisplay = (value: string) => {
      const parsed = Number.parseFloat(value.replace(",", "."));
      if (Number.isNaN(parsed)) {
        return value;
      }
      return formatAssumed20ForDisplay(parsed, displayScale).value.toFixed(2);
    };

    return (
      <>
        <Stack gap={8} width={"105%"} style={{ marginLeft: "-2.5%" }}>
          <AnimatedPressable onPress={() => setDisplayUEs(!displayUEs)} style={{ width: '100%' }}>
            <Stack direction='horizontal' gap={8} vAlign='start' hAlign='center' style={{ opacity: 0.6 }} padding={[12, 6]} backgroundColor={!displayUEs ? colors.text + '22' : 'transparent'} radius={12}>
              <Icon size={20}>
                <Papicons name='pie' />
              </Icon>
              <Typography variant='title' color='textPrimary' style={{ flex: 1 }}>
                Unités d'enseignement
              </Typography>
              <Icon>
                <Papicons name={displayUEs ? 'chevronup' : 'chevrondown'} />
              </Icon>
            </Stack>
          </AnimatedPressable>

          {displayUEs && (
            <Dynamic
              animated
              entering={PapillonAppearIn}
              exiting={PapillonAppearOut}
            >
              <List style={{ width: "95%", marginLeft: "2.5%" }}>
                <List.Section>
                  {Object.entries(data).map(([key, value]) => (
                    <List.Item key={key} onPress={() => setOpenedUE(key)}>
                      <List.Leading>
                        <Stack backgroundColor={value.color + "22"} padding={[8, 4]} borderRadius={8}>
                          <Typography variant='title' style={{ color: adjust(value.color, -0.2) }}>
                            {key}
                          </Typography>
                        </Stack>
                      </List.Leading>
                      <Typography numberOfLines={2} variant='action' color='textPrimary'>{value.titre}</Typography>
                      <List.Trailing>
                        <Stack direction='horizontal' gap={8} hAlign='center'>
                          <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0}>
                            <Typography variant='title' color='textPrimary'>
                              {toDisplay(value.moyenne.value)}
                            </Typography>
                            <Typography variant='body2' color="textSecondary">
                              {scaleDenominator}
                            </Typography>
                          </Stack>

                          <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                            <Typography variant='title' color='textPrimary'>
                              {value.moyenne.rang}
                            </Typography>
                            <Typography variant='body2' color="textSecondary">
                              /{value.moyenne.total}
                            </Typography>
                          </Stack>
                        </Stack>
                      </List.Trailing>
                    </List.Item>
                  ))}
                </List.Section>
              </List>
            </Dynamic>
          )}
        </Stack>

        <Modal
          presentationStyle='formSheet'
          visible={!!openedUE}
          onDismiss={() => setOpenedUE(null)}
          onRequestClose={() => setOpenedUE(null)}
          animationType='slide'
        >
          {openedUE && (
            <View
              style={{
                flex: 1,
                width: '100%'
              }}
            >
              <LinearGradient
                colors={[data[openedUE].color, colors.background]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 260,
                  zIndex: -9,
                  opacity: 0.3,
                }}
              />

              <List
                style={{ backgroundColor: "transparent" }}
                contentContainerStyle={{ padding: 24 }}
                ListHeaderComponent={(
                  <Stack gap={16} style={{ marginBottom: 16 }}>
                    <Stack direction='horizontal' width='100%' vAlign='center' hAlign='center'>
                      <Stack backgroundColor={data[openedUE].color + "22"} padding={[8, 4]} borderRadius={8}>
                        <Typography variant='title' style={{ color: adjust(data[openedUE].color, -0.2) }}>
                          {openedUE}
                        </Typography>
                      </Stack>
                      <Typography variant='body2' color='textSecondary' align='right' style={{ flex: 1 }}>
                        ECTS : {data[openedUE].ECTS.acquis} / {data[openedUE].ECTS.total}
                      </Typography>
                    </Stack>
                    <Typography variant='h4'>
                      {data[openedUE].titre}
                    </Typography>
                    <Stack direction='horizontal' hAlign='end' gap={4}>
                      <Typography variant='h1'>
                        {toDisplay(data[openedUE].moyenne.value)}
                      </Typography>
                      <Typography variant='title' color='textSecondary'>
                        {scaleDenominator}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
              >
                <List.Section>
                  <List.SectionTitle>
                    <List.Label>Statistiques</List.Label>
                  </List.SectionTitle>

                  <List.Item>
                    <List.Leading>
                      <Icon>
                        <Papicons name='user' />
                      </Icon>
                    </List.Leading>
                    <Typography variant='title'>
                      Rang
                    </Typography>
                    <Typography variant='body1' color='textSecondary'>
                      Emplacement dans la classe
                    </Typography>
                    <List.Trailing>
                      <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                        <Typography variant='title'>
                          {data[openedUE].moyenne.rang}
                        </Typography>
                        <Typography variant='body2' color="textSecondary">
                          /{data[openedUE].moyenne.total}
                        </Typography>
                      </Stack>
                    </List.Trailing>
                  </List.Item>

                  <List.Item>
                    <List.Leading>
                      <Icon>
                        <Papicons name='GraduationHat' />
                      </Icon>
                    </List.Leading>
                    <Typography variant='title'>
                      Moyenne de classe
                    </Typography>
                    <List.Trailing>
                      <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                        <Typography variant='title'>
                          {toDisplay(data[openedUE].moyenne.moy)}
                        </Typography>
                        <Typography variant='body2' color="textSecondary">
                          {scaleDenominator}
                        </Typography>
                      </Stack>
                    </List.Trailing>
                  </List.Item>

                  <List.Item>
                    <List.Leading>
                      <Icon>
                        <Papicons name='ArrowRightUp' />
                      </Icon>
                    </List.Leading>
                    <Typography variant='title'>
                      Moyenne basse
                    </Typography>
                    <List.Trailing>
                      <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                        <Typography variant='title'>
                          {toDisplay(data[openedUE].moyenne.min)}
                        </Typography>
                        <Typography variant='body2' color="textSecondary">
                          {scaleDenominator}
                        </Typography>
                      </Stack>
                    </List.Trailing>
                  </List.Item>

                  <List.Item>
                    <List.Leading>
                      <Icon>
                        <Papicons name='minus' />
                      </Icon>
                    </List.Leading>
                    <Typography variant='title'>
                      Moyenne haute
                    </Typography>
                    <List.Trailing>
                      <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                        <Typography variant='title'>
                          {toDisplay(data[openedUE].moyenne.max)}
                        </Typography>
                        <Typography variant='body2' color="textSecondary">
                          {scaleDenominator}
                        </Typography>
                      </Stack>
                    </List.Trailing>
                  </List.Item>
                </List.Section>

                <List.Section>
                  <List.SectionTitle>
                    <List.Label>SAE</List.Label>
                  </List.SectionTitle>
                  {Object.entries(data[openedUE].saes).map(([key, value]) => (
                    <List.Item key={key}>
                      <Typography variant='title'>
                        {key}
                      </Typography>
                      <List.Trailing>
                        <Stack direction='horizontal' gap={8} hAlign='center'>
                          <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0}>
                            <Typography variant='title'>
                              {toDisplay(value.moyenne)}
                            </Typography>
                            <Typography variant='body2' color="textSecondary">
                              {scaleDenominator}
                            </Typography>
                          </Stack>
                          <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                            <Typography variant='title'>
                              x{value.coef}
                            </Typography>
                          </Stack>
                        </Stack>
                      </List.Trailing>
                    </List.Item>
                  ))}
                </List.Section>

                <List.Section>
                  <List.SectionTitle>
                    <List.Label>Ressources</List.Label>
                  </List.SectionTitle>
                  {Object.entries(data[openedUE].ressources).map(([key, value]) => (
                    <List.Item key={key}>
                      <Typography variant='title'>
                        {key}
                      </Typography>
                      <List.Trailing>
                        <Stack direction='horizontal' gap={8} hAlign='center'>
                          <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0}>
                            <Typography variant='title'>
                              {toDisplay(value.moyenne)}
                            </Typography>
                            <Typography variant='body2' color="textSecondary">
                              {scaleDenominator}
                            </Typography>
                          </Stack>
                          <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                            <Typography variant='title'>
                              x{value.coef}
                            </Typography>
                          </Stack>
                        </Stack>
                      </List.Trailing>
                    </List.Item>
                  ))}
                </List.Section>
              </List>
            </View>
          )}
        </Modal>
      </>
    );
  }
  catch (error) {
    return null;
  }
};

export default ScodocUES;
