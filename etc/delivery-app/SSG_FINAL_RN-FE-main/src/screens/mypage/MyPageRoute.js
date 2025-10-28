import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MyECO from './MyECO';
import ProfilePage from './ProfilePage';
import MileageHistory from './MyMileageHistory';
import { theme } from '../../core/theme'

const Tab = createBottomTabNavigator();

const commonHeaderStyle = {
  headerTitle: '',
  headerStyle: {
    backgroundColor: theme.colors.surface,
    height: 40,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
};

export default function MyPageRoute() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'My ECO') {
            iconName = 'leaf';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'user' : 'user-o';
          } else if (route.name === 'History') {
            iconName = 'history';
          }
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'green',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      })}
    >
      <Tab.Screen 
        name="My ECO" 
        component={MyECO} 
        options={commonHeaderStyle}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfilePage} 
        options={commonHeaderStyle}
      />
      <Tab.Screen 
        name="History" 
        component={MileageHistory} 
        options={commonHeaderStyle}
      />
    </Tab.Navigator>
  );
}
