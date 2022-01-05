import React from 'react';
import QuestionnaireComponent from './componants/questionnaire';
import FormComponent from './componants/Form';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {

  //Hook pour une police personnalisée
  let [fontLoaded] = useFonts({
    'Binjay': require('./assets/fonts/Binjay.ttf'),
  });

  if (!fontLoaded) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  }
  else {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={FormComponent} />
          <Stack.Screen name="Questionnaire" component={QuestionnaireComponent} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
};