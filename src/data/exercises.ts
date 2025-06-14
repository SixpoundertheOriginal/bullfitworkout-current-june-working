
import { Exercise } from '@/types/exercise';

export const exerciseDatabase: Exercise[] = [
  {
    id: '1',
    name: 'Bench Press',
    description: 'A classic upper body exercise that targets the chest, shoulders, and triceps.',
    primary_muscle_groups: ['chest'],
    secondary_muscle_groups: ['shoulders', 'triceps'],
    equipment_type: ['barbell', 'bench'],
    difficulty: 'intermediate',
    movement_pattern: 'push',
    is_compound: true,
    is_bodyweight: false,
    instructions: {
      steps: "1. Lie on a flat bench with your feet flat on the floor. \n2. Grip the barbell with hands slightly wider than shoulder-width apart. \n3. Lift the bar off the rack and hold it straight over your chest. \n4. Lower the bar slowly to your chest, then push it back up to the starting position.",
      form: "Keep your back flat on the bench and avoid arching. Control the weight on the way down and explode on the way up."
    },
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Squat',
    description: 'A fundamental lower body exercise that works the quads, hamstrings, and glutes.',
    primary_muscle_groups: ['legs', 'quads', 'glutes'],
    secondary_muscle_groups: ['hamstrings', 'core'],
    equipment_type: ['barbell'],
    difficulty: 'intermediate',
    movement_pattern: 'squat',
    is_compound: true,
    is_bodyweight: false,
    instructions: {
      steps: "1. Stand with your feet shoulder-width apart, with the barbell resting on your upper back. \n2. Keeping your chest up and back straight, lower your hips as if sitting in a chair. \n3. Go as low as you can comfortably, ideally until your thighs are parallel to the floor. \n4. Push through your heels to return to the starting position.",
      form: "Maintain a neutral spine throughout the movement. Your knees should track over your toes."
    },
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Deadlift',
    description: 'A full-body compound exercise that builds strength in the posterior chain.',
    primary_muscle_groups: ['back', 'legs', 'hamstrings', 'glutes'],
    secondary_muscle_groups: ['core', 'lats'],
    equipment_type: ['barbell'],
    difficulty: 'advanced',
    movement_pattern: 'hinge',
    is_compound: true,
    is_bodyweight: false,
    instructions: {
      steps: "1. Stand with your mid-foot under the barbell. \n2. Hinge at your hips and grip the bar with hands just outside your shins. \n3. Keeping your back straight, chest up, and hips down, lift the weight by extending your hips and knees. \n4. Lower the bar with control by reversing the motion.",
      form: "Keep the bar close to your body. Do not round your lower back. Drive with your legs."
    },
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Pull Up',
    description: 'An upper-body exercise that primarily works the back and biceps.',
    primary_muscle_groups: ['back', 'lats'],
    secondary_muscle_groups: ['biceps', 'shoulders'],
    equipment_type: ['bodyweight'],
    difficulty: 'intermediate',
    movement_pattern: 'pull',
    is_compound: true,
    is_bodyweight: true,
    instructions: {
      steps: "1. Grab the pull-up bar with an overhand grip, slightly wider than shoulder-width. \n2. Hang with your arms fully extended. \n3. Pull your body up until your chin is over the bar. \n4. Lower yourself back down with control.",
      form: "Engage your core and avoid swinging. Squeeze your shoulder blades together at the top of the movement."
    },
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Dumbbell Shoulder Press',
    description: 'An exercise for building shoulder strength and size.',
    primary_muscle_groups: ['shoulders'],
    secondary_muscle_groups: ['triceps'],
    equipment_type: ['dumbbell', 'bench'],
    difficulty: 'beginner',
    movement_pattern: 'push',
    is_compound: true,
    is_bodyweight: false,
    instructions: {
      steps: "1. Sit on a bench with back support, holding a dumbbell in each hand at shoulder height. \n2. Your palms should be facing forward. \n3. Press the dumbbells overhead until your arms are fully extended. \n4. Lower the dumbbells back to the starting position.",
      form: "Keep your core tight and avoid arching your back. Don't let the dumbbells touch at the top."
    },
    created_at: new Date().toISOString(),
  },
   {
    id: '6',
    name: 'Bicep Curl',
    description: 'An isolation exercise for the biceps.',
    primary_muscle_groups: ['arms', 'biceps'],
    secondary_muscle_groups: [],
    equipment_type: ['dumbbell'],
    difficulty: 'beginner',
    movement_pattern: 'pull',
    is_compound: false,
    is_bodyweight: false,
    instructions: {
      steps: "1. Stand or sit holding a dumbbell in each hand with an underhand grip. \n2. Curl the weights up towards your shoulders, keeping your elbows stationary. \n3. Squeeze your biceps at the top. \n4. Lower the weights back down with control.",
      form: "Avoid using momentum or swinging your body."
    },
    created_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Plank',
    description: 'A core stability exercise that strengthens the abs, back, and shoulders.',
    primary_muscle_groups: ['core', 'abs'],
    secondary_muscle_groups: ['shoulders'],
    equipment_type: ['bodyweight'],
    difficulty: 'beginner',
    movement_pattern: 'core',
    is_compound: false,
    is_bodyweight: true,
    instructions: {
      steps: "1. Get into a push-up position, but rest on your forearms instead of your hands. \n2. Keep your body in a straight line from head to heels. \n3. Engage your core and glutes. \n4. Hold this position for the desired amount of time.",
      form: "Don't let your hips sag or rise too high."
    },
    created_at: new Date().toISOString(),
  },
];
