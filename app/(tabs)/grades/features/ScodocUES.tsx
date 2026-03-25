import { Papicons } from '@getpapillon/papicons';
import React from 'react';

import Icon from '@/ui/components/Icon';
import Item, { Leading, Trailing } from '@/ui/components/Item';
import List from '@/ui/components/List';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import adjust from '@/utils/adjustColor';
import { Modal, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@react-navigation/native';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import { Dynamic } from '@/ui/components/Dynamic';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';

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

const ScodocUES: React.FC<{ data: UEMap }> = ({ data }) => {
  try {
    const { colors } = useTheme();
    const [openedUE, setOpenedUE] = React.useState<string | null>(null);
    const [displayUEs, setDisplayUEs] = React.useState(false);

    return (
      <>
        <Stack gap={8}>

          <AnimatedPressable onPress={() => setDisplayUEs(!displayUEs)} style={{ width: '100%' }}>
            <Stack direction='horizontal' gap={8} vAlign='start' hAlign='center' style={{ opacity: 0.6 }} padding={[10, 2]} backgroundColor={!displayUEs ? colors.text + '22' : 'transparent'} radius={12}>
              <Icon size={20}>
                <Papicons name='pie' />
              </Icon>
              <Typography variant='h6' color='text' style={{ flex: 1 }}>
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
              <List>
                {Object.entries(data).map(([key, value]) => (
                  <Item key={key} onPress={() => setOpenedUE(key)}>
                    <Leading>
                      <Stack backgroundColor={value.color + "22"} padding={[8, 4]} borderRadius={8}>
                        <Typography variant='title' color='text' color={adjust(value.color, -0.2)}>
                          {key}
                        </Typography>
                      </Stack>
                    </Leading>
                    <Typography nowrap variant='body1' color='text'>{value.titre}</Typography>
                    <Trailing>
                      <Stack direction='horizontal' gap={8} hAlign='center'>
                        <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0}>
                          <Typography variant='navigation' color='text'>
                            {value.moyenne.value}
                          </Typography>
                          <Typography variant='body2' color="secondary">
                            /20
                          </Typography>
                        </Stack>

                        <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                          <Typography variant='navigation' color='text'>
                            {value.moyenne.rang}
                          </Typography>
                          <Typography variant='body2' color="secondary">
                            /{value.moyenne.total}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Trailing>
                  </Item>
                ))}
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
          <View
            style={{
              backgroundColor: colors.background,
              flex: 1,
            }}
          >
            {openedUE && (
              <>
                <LinearGradient
                  colors={[data[openedUE].color, data[openedUE].color + "00"]}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 200,
                    zIndex: 1,
                    opacity: 0.2,
                  }}
                />

                <ScrollView style={{ zIndex: 2 }}>
                  <Stack padding={24} width='100%' gap={24}>
                    <Stack vAlign='start' hAlign='start' gap={8}>
                      <Stack direction='horizontal' width='100%' vAlign='center' hAlign='center'>
                        <Stack backgroundColor={data[openedUE].color + "22"} padding={[8, 4]} borderRadius={8}>
                          <Typography variant='title' color='text' color={adjust(data[openedUE].color, -0.2)}>
                            {openedUE}
                          </Typography>
                        </Stack>

                        <Typography variant='body2' color='secondary' align='right' style={{ flex: 1 }}>
                          ECTS : {data[openedUE].ECTS.acquis} / {data[openedUE].ECTS.total}
                        </Typography>
                      </Stack>

                      <Typography variant='navigation' color='text'>
                        {data[openedUE].titre}
                      </Typography>

                      <Stack direction='horizontal' vAlign='end' hAlign='end' gap={2}>
                        <Typography variant='h1' weight='semibold' inline color='text'>
                          {data[openedUE].moyenne.value}
                        </Typography>
                        <Typography variant='title' color="secondary">
                          /20
                        </Typography>
                      </Stack>
                    </Stack>

                    <List>
                      <Item>
                        <Icon>
                          <Papicons name='user' />
                        </Icon>
                        <Typography variant='title'>
                          Rang
                        </Typography>
                        <Typography variant='body2' color='secondary'>
                          Emplacement dans la classe
                        </Typography>
                        <Trailing>
                          <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                            <Typography variant='navigation' color='text'>
                              {data[openedUE].moyenne.rang}
                            </Typography>
                            <Typography variant='body2' color="secondary">
                              /{data[openedUE].moyenne.total}
                            </Typography>
                          </Stack>
                        </Trailing>
                      </Item>
                      <Item>
                        <Icon>
                          <Papicons name='GraduationHat' />
                        </Icon>
                        <Typography>
                          Moyenne de classe
                        </Typography>
                        <Trailing>
                          <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                            <Typography variant='navigation' color='text'>
                              {data[openedUE].moyenne.moy}
                            </Typography>
                            <Typography variant='body2' color="secondary">
                              /20
                            </Typography>
                          </Stack>
                        </Trailing>
                      </Item>
                      <Item>
                        <Icon>
                          <Papicons name='ArrowRightUp' />
                        </Icon>
                        <Typography>
                          Moyenne basse
                        </Typography>
                        <Trailing>
                          <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                            <Typography variant='navigation' color='text'>
                              {data[openedUE].moyenne.min}
                            </Typography>
                            <Typography variant='body2' color="secondary">
                              /20
                            </Typography>
                          </Stack>
                        </Trailing>
                      </Item>
                      <Item>
                        <Icon>
                          <Papicons name='minus' />
                        </Icon>
                        <Typography>
                          Moyenne haute
                        </Typography>
                        <Trailing>
                          <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                            <Typography variant='navigation' color='text'>
                              {data[openedUE].moyenne.max}
                            </Typography>
                            <Typography variant='body2' color="secondary">
                              /20
                            </Typography>
                          </Stack>
                        </Trailing>
                      </Item>
                    </List>

                    <List>
                      {Object.entries(data[openedUE].saes).map(([key, value]) => (
                        <Item key={key}>
                          <Typography variant='title'>
                            {key}
                          </Typography>
                          <Trailing>
                            <Stack direction='horizontal' gap={8} hAlign='center'>
                              <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0}>
                                <Typography variant='navigation' color='text'>
                                  {value.moyenne}
                                </Typography>
                                <Typography variant='body2' color="secondary">
                                  /20
                                </Typography>
                              </Stack>

                              <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                                <Typography variant='navigation' color='text'>
                                  x{value.coef}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Trailing>
                        </Item>
                      ))}
                    </List>

                    <List>
                      {Object.entries(data[openedUE].ressources).map(([key, value]) => (
                        <Item key={key}>
                          <Typography variant='title'>
                            {key}
                          </Typography>
                          <Trailing>
                            <Stack direction='horizontal' gap={8} hAlign='center'>
                              <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0}>
                                <Typography variant='navigation' color='text'>
                                  {value.moyenne}
                                </Typography>
                                <Typography variant='body2' color="secondary">
                                  /20
                                </Typography>
                              </Stack>

                              <Stack direction='horizontal' vAlign='end' hAlign='end' gap={0} padding={[8, 2]} bordered radius={8}>
                                <Typography variant='navigation' color='text'>
                                  x{value.coef}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Trailing>
                        </Item>
                      ))}
                    </List>
                  </Stack>
                </ScrollView>
              </>
            )}
          </View>
        </Modal>
      </>
    );
  }
  catch (error) {
    return null;
  }
};

export default ScodocUES;