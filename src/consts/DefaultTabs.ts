
export const defaultTabs = [
  {
    tab: "Home",
    label: "主页", // Accueil -> Home
    description: "蝴蝶应用的精华", // L'essentiel de Papillon -> The essence of Papillon app
    icon: require("@/../assets/lottie/tab_home.json"),
    enabled: true,
    installed: true,
  },
  {
    tab: "Lessons",
    label: "课程", // Cours -> Lessons/Classes
    description: "查看您的时间表", // Consulte ton emploi du temps -> Check your timetable
    icon: require("@/../assets/lottie/tab_calendar.json"),
    enabled: true,
  },
  {
    tab: "Homeworks",
    label: "作业", // Devoirs -> Homework
    description: "管理您的待办作业", // Organise ton travail à faire -> Organize your homework to do
    icon: require("@/../assets/lottie/tab_book_2.json"),
    enabled: true,
  },
  {
    tab: "Grades",
    label: "成绩", // Notes -> Grades
    description: "您的最新成绩和平均分", // Tes dernières notes et moyennes -> Your latest grades and averages
    icon: require("@/../assets/lottie/tab_chart.json"),
    enabled: true,
  },
  {
    tab: "News",
    label: "新闻", // Actualités -> News
    description: "学校的最新消息", // Les dernières actualités de ton école -> Latest news from your school
    icon: require("@/../assets/lottie/tab_news.json"),
    enabled: true,
  },
  {
    tab: "Attendance",
    label: "校园生活", // Vie scolaire -> School life
    description: "您的缺勤、迟到和处分", // Tes absences, retards et sanctions -> Your absences, tardiness and sanctions
    icon: require("@/../assets/lottie/tab_check.json"),
    enabled: true,
  },
  {
    tab: "Discussions",
    label: "讨论", // Discussions -> Discussions
    description: "您的学校消息", // Ta messagerie scolaire -> Your school messaging
    icon: require("@/../assets/lottie/tab_chat.json"),
    enabled: true,
  },
  {
    tab: "Menu",
    label: "食堂", // Cantine -> Cafeteria
    description: "查看即将到来的餐食", // Consulte les repas à venir -> Check upcoming meals
    icon: require("@/../assets/lottie/tab_pizza.json"),
    enabled: true,
  },
  {
    tab: "Evaluation",
    label: "能力", // Compétences -> Skills/Competencies
    description: "您的技能和评估", // Tes compétences et évaluations -> Your skills and evaluations
    icon: require("@/../assets/lottie/tab_evaluations.json"),
    enabled: true,
  },
  {
    tab: "Week",
    label: "周", // Semaine -> Week
    description: "周的高级视图", // Vue avancée de la semaine -> Advanced view of the week
    icon: require("@/../assets/lottie/tab_calendar.json"),
    enabled: true,
  },
] as const;