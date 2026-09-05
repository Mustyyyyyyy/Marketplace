import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { bootstrap, authStore, handleGoogleRedirect } from './lib/auth';
import { colors } from './ui/theme';

import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/auth/ResetPasswordScreen';
import VerifyEmailScreen from './screens/auth/VerifyEmailScreen';
import VerifyIdentityScreen from './screens/auth/VerifyIdentityScreen';
import AuthCallbackScreen from './screens/auth/AuthCallbackScreen';

import HomeScreen from './screens/HomeScreen';
import BrowseScreen from './screens/BrowseScreen';
import CreateTaskScreen from './screens/tasks/CreateTaskScreen';
import TaskDetailScreen from './screens/tasks/TaskDetailScreen';
import MyTasksScreen from './screens/tasks/MyTasksScreen';
import OffersScreen from './screens/offers/OffersScreen';
import MessagesListScreen from './screens/messages/MessagesListScreen';
import ChatScreen from './screens/messages/ChatScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import TaskerExtrasScreen from './screens/TaskerExtrasScreen';
import PublicTaskerScreen from './screens/PublicTaskerScreen';
import LeaveReviewScreen from './screens/LeaveReviewScreen';

import MyJobsScreen from './screens/dashboard/MyJobsScreen';
import FindTasksScreen from './screens/dashboard/FindTasksScreen';
import TaskersScreen from './screens/dashboard/TaskersScreen';
import ReviewsScreen from './screens/dashboard/ReviewsScreen';
import AvailabilityScreen from './screens/dashboard/AvailabilityScreen';
import PaymentsScreen from './screens/dashboard/PaymentsScreen';
import SettingsScreen from './screens/dashboard/SettingsScreen';

import { AboutScreen } from './screens/marketing/AboutScreen';
import { HowItWorksScreen } from './screens/marketing/HowItWorksScreen';
import { FindTasksScreen as FindTasksMarketingScreen } from './screens/marketing/FindTasksScreen';
import { FindTaskersScreen as FindTaskersMarketingScreen } from './screens/marketing/FindTaskersScreen';
import { BecomeATaskerScreen } from './screens/marketing/BecomeATaskerScreen';
import { ProScreen } from './screens/marketing/ProScreen';
import { TrustSafetyScreen } from './screens/marketing/TrustSafetyScreen';
import CategoriesScreen from './screens/marketing/CategoriesScreen';
import { KYCScreen, AntiFraudScreen, DisputesScreen, HowPaymentsWorkScreen, SafetyGuideScreen, CareersScreen, PressScreen, BlogScreen, HelpScreen, ContactScreen, ReportScreen, CookiesScreen, PrivacyScreen, TermsScreen } from './screens/marketing/InfoScreens';

export type RootStackParamList = {
  Tabs: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string } | undefined;
  VerifyEmail: { devToken?: string };
  TaskDetail: { id: string };
  CreateTask: { id?: string } | undefined;
  EditProfile: undefined;
  TaskerExtras: undefined;
  PublicTasker: { id: string };
  Chat: { conversationId: string; title?: string };
  LeaveReview: { taskId: string; revieweeName?: string };
  Browse: { q?: string; categoryId?: string } | undefined;
  Notifications: undefined;
  Offers: { taskId?: string } | undefined;
  MyTasks: undefined;
  MyJobs: undefined;
  FindTasks: undefined;
  Taskers: undefined;
  Reviews: undefined;
  Availability: undefined;
  Payments: undefined;
  Settings: undefined;
  About: undefined;
  HowItWorks: undefined;
  Categories: undefined;
  BecomeATasker: undefined;
  Pro: undefined;
  TrustSafety: undefined;
  HowPaymentsWork: undefined;
  AntiFraud: undefined;
  Disputes: undefined;
  SafetyGuide: undefined;
  Careers: undefined;
  Press: undefined;
  Blog: undefined;
  Help: undefined;
  Contact: undefined;
  Report: undefined;
  Cookies: undefined;
  Privacy: undefined;
  Terms: undefined;
  Kyc: undefined;
  VerifyIdentity: undefined;
  AuthCallback: { access: string; refresh: string; provider?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

function TabsNav() {
  const auth = authStore.use();
  const isTasker = auth.user?.role === 'TASKER';
  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.brand },
        headerTitleStyle: { color: '#fff' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.subtle,
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.card, height: 64, paddingTop: 6, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} /> }} />
      <Tabs.Screen name="Browse" component={BrowseScreen} options={{ title: 'Browse', tabBarIcon: ({ color }) => <Ionicons name="search" size={22} color={color} /> }} />
      {isTasker ? (
        <Tabs.Screen name="MyJobs" component={MyJobsScreen} options={{ title: 'My jobs', tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={22} color={color} /> }} />
      ) : (
        <Tabs.Screen name="MyTasks" component={MyTasksScreen} options={{ title: 'My tasks', tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={22} color={color} /> }} />
      )}
      <Tabs.Screen name="Messages" component={MessagesListScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={22} color={color} /> }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} /> }} />
    </Tabs.Navigator>
  );
}

// KYC gate: if the user is signed in but KYC isn't complete, send them to
// the VerifyIdentity screen instead of the Tabs.
function PostAuthNav() {
  const auth = authStore.use();
  if (auth.user && auth.user.kycStatus && auth.user.kycStatus !== 'APPROVED') {
    return <Stack.Screen name="VerifyIdentity" component={VerifyIdentityScreen} options={{ title: 'Verify your identity', headerStyle: { backgroundColor: colors.brand }, headerTitleStyle: { color: '#fff' }, headerTintColor: '#fff' }} />;
  }
  return (
    <>
      <Stack.Screen name="Tabs" component={TabsNav} options={{ headerShown: false }} />
      <Stack.Screen name="VerifyIdentity" component={VerifyIdentityScreen} options={{ title: 'Verify your identity', headerStyle: { backgroundColor: colors.brand }, headerTitleStyle: { color: '#fff' }, headerTintColor: '#fff' }} />
    </>
  );
}

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'marketplace://',
    process.env.EXPO_PUBLIC_APP_URL || 'http://localhost',
  ],
  config: {
    screens: {
      ResetPassword: 'auth/reset-password',
      TaskDetail: 'tasks/:id',
      PublicTasker: 'taskers/:id',
      Tabs: '',
      AuthCallback: 'auth/callback',
    },
  },
};

export default function App() {
  const auth = authStore.use();
  useEffect(() => { bootstrap(); handleGoogleRedirect(); }, []);

  if (!auth.bootstrapped) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}><ActivityIndicator color={colors.accent} /></View>;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.brand }, headerTitleStyle: { color: '#fff' }, headerTintColor: '#fff' }}>
        {auth.user ? (
          <>
            <PostAuthNav />
            <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task' }} />
            <Stack.Screen name="CreateTask" component={CreateTaskScreen} options={{ title: 'New Task' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
            <Stack.Screen name="TaskerExtras" component={TaskerExtrasScreen} options={{ title: 'Tasker Settings' }} />
            <Stack.Screen name="PublicTasker" component={PublicTaskerScreen} options={{ title: 'Tasker' }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params?.title || 'Chat' })} />
            <Stack.Screen name="LeaveReview" component={LeaveReviewScreen} options={{ title: 'Leave a Review' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
            <Stack.Screen name="Offers" component={OffersScreen} options={{ title: 'Offers' }} />
            <Stack.Screen name="MyTasks" component={MyTasksScreen} options={{ title: 'My tasks' }} />
            <Stack.Screen name="MyJobs" component={MyJobsScreen} options={{ title: 'My jobs' }} />
            <Stack.Screen name="FindTasks" component={FindTasksScreen} options={{ title: 'Find tasks' }} />
            <Stack.Screen name="Taskers" component={TaskersScreen} options={{ title: 'Find taskers' }} />
            <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ title: 'Reviews' }} />
            <Stack.Screen name="Availability" component={AvailabilityScreen} options={{ title: 'Availability' }} />
            <Stack.Screen name="Payments" component={PaymentsScreen} options={{ title: 'Payments' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
            <Stack.Screen name="HowItWorks" component={HowItWorksScreen} options={{ title: 'How it works' }} />
            <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categories' }} />
            <Stack.Screen name="BecomeATasker" component={BecomeATaskerScreen} options={{ title: 'Become a tasker' }} />
            <Stack.Screen name="Pro" component={ProScreen} options={{ title: 'TaskSphere Pro' }} />
            <Stack.Screen name="TrustSafety" component={TrustSafetyScreen} options={{ title: 'Trust & safety' }} />
            <Stack.Screen name="HowPaymentsWork" component={HowPaymentsWorkScreen} options={{ title: 'Payments' }} />
            <Stack.Screen name="AntiFraud" component={AntiFraudScreen} options={{ title: 'Anti-fraud' }} />
            <Stack.Screen name="Disputes" component={DisputesScreen} options={{ title: 'Disputes' }} />
            <Stack.Screen name="SafetyGuide" component={SafetyGuideScreen} options={{ title: 'Safety guide' }} />
            <Stack.Screen name="Careers" component={CareersScreen} options={{ title: 'Careers' }} />
            <Stack.Screen name="Press" component={PressScreen} options={{ title: 'Press' }} />
            <Stack.Screen name="Blog" component={BlogScreen} options={{ title: 'Blog' }} />
            <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help' }} />
            <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contact' }} />
            <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Report' }} />
            <Stack.Screen name="Cookies" component={CookiesScreen} options={{ title: 'Cookies' }} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy' }} />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms' }} />
            <Stack.Screen name="Kyc" component={KYCScreen} options={{ title: 'KYC' }} />
            <Stack.Screen name="Browse" component={BrowseScreen} options={{ title: 'Browse' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot password' }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset password' }} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ title: 'Verify email' }} />
            <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
