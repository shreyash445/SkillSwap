import random

from django.core.management.base import BaseCommand

from core.models import Exchange, Rating, Skill, User, UserSkill

SKILLS = [
    ("Python", "technical", "Programming language for data, automation and apps"),
    ("JavaScript", "technical", "Language of the web"),
    ("Web Development", "technical", "HTML, CSS and building websites"),
    ("Data Science", "technical", "Statistics, pandas, and insight from data"),
    ("Excel", "technical", "Spreadsheets, formulas and pivot tables"),
    ("Machine Learning", "technical", "Models, scikit-learn, deep learning basics"),
    ("SQL", "technical", "Querying and designing relational databases"),
    ("Git & GitHub", "technical", "Version control and collaboration"),
    ("React", "technical", "Building modern user interfaces"),
    ("Node.js", "technical", "JavaScript on the server"),
    ("C++", "technical", "Systems programming and algorithms"),
    ("Java", "technical", "Object-oriented programming language"),
    ("Linux", "technical", "Terminal, bash and system administration"),
    ("Cybersecurity", "technical", "Security fundamentals and safe practices"),
    ("Mobile Development", "technical", "Building iOS and Android apps"),
    ("UI/UX Design", "creative", "Interfaces and user experience"),
    ("Graphic Design", "creative", "Visual design and composition"),
    ("Video Editing", "creative", "Cutting, effects and color grading"),
    ("Photography", "creative", "Cameras, lighting and composition"),
    ("Writing", "creative", "Essays, storytelling and copywriting"),
    ("Drawing", "creative", "Sketching and illustration"),
    ("Digital Art", "creative", "Illustration with drawing tablets"),
    ("Public Speaking", "creative", "Presenting with confidence"),
    ("Music Production", "creative", "Beats, mixing and DAWs"),
    ("Cooking", "creative", "Meal prep and everyday cooking"),
    ("Spanish", "language", "Conversational Spanish"),
    ("French", "language", "Conversational French"),
    ("Mandarin", "language", "Conversational Mandarin"),
    ("German", "language", "Conversational German"),
    ("Japanese", "language", "Conversational Japanese"),
    ("Korean", "language", "Conversational Korean"),
    ("Hindi", "language", "Conversational Hindi"),
    ("Arabic", "language", "Conversational Arabic"),
    ("Portuguese", "language", "Conversational Portuguese"),
    ("Italian", "language", "Conversational Italian"),
    ("Swimming", "sports", "Stroke technique and endurance"),
    ("Badminton", "sports", "Racket skills and match play"),
    ("Yoga", "sports", "Flexibility, breath and balance"),
    ("Guitar", "sports", "Chords, strumming and songs"),
    ("Piano", "sports", "Keyboard skills and music theory"),
    ("Basketball", "sports", "Ball handling and shooting"),
    ("Football", "sports", "Dribbling, passing and tactics"),
    ("Running", "sports", "Pacing and endurance training"),
    ("Calisthenics", "sports", "Bodyweight strength training"),
    ("Chess", "sports", "Openings, tactics and endgames"),
    ("Tennis", "sports", "Serve, forehand and match play"),
    ("Table Tennis", "sports", "Spin, serves and rallies"),
    ("Skateboarding", "sports", "Balance, tricks and safety"),
    ("Rock Climbing", "sports", "Technique, belaying and safety"),
    ("Martial Arts", "sports", "Striking, grappling and discipline"),
]

DEMO_USERS = [
    {
        "email": "shreyashkumbhar004@gmail.com",
        "first_name": "Shreyash",
        "last_name": "Kumbhar",
        "password": "123456789",
        "bio": "Building SkillSwap — let's trade skills.",
        "availability": "Flexible",
        "offers": [("Python", "advanced"), ("Mobile Development", "intermediate")],
        "wants": ["Machine Learning", "Graphic Design"],
    },
    {
        "email": "alice.chen@student.edu",
        "first_name": "Alice",
        "last_name": "Chen",
        "bio": "CS sophomore who lives in the library. Will trade Python for anything musical.",
        "availability": "Weekends, after 3pm",
        "offers": [("Python", "advanced"), ("JavaScript", "intermediate")],
        "wants": ["Guitar", "Spanish"],
    },
    {
        "email": "bob.davis@student.edu",
        "first_name": "Bob",
        "last_name": "Davis",
        "bio": "Guitarist in a campus band. Happy to teach chords for data skills.",
        "availability": "Mon/Wed/Fri evenings",
        "offers": [("Guitar", "advanced"), ("Badminton", "intermediate")],
        "wants": ["Python", "Data Science"],
    },
    {
        "email": "carol.white@student.edu",
        "first_name": "Carol",
        "last_name": "White",
        "bio": "Design student. Pixels by day, photography walks by night.",
        "availability": "Tue/Thu afternoons",
        "offers": [("Graphic Design", "advanced"), ("Photography", "intermediate")],
        "wants": ["Web Development", "French"],
    },
    {
        "email": "diego.ramirez@student.edu",
        "first_name": "Diego",
        "last_name": "Ramirez",
        "bio": "Native Spanish speaker who somehow still can't touch type.",
        "availability": "Most evenings",
        "offers": [("Spanish", "advanced"), ("Football", "intermediate")],
        "wants": ["JavaScript", "Excel"],
    },
    {
        "email": "emma.nguyen@student.edu",
        "first_name": "Emma",
        "last_name": "Nguyen",
        "bio": "Pre-med student who codes on the side. Tea enthusiast.",
        "availability": "Weekends",
        "offers": [("Excel", "advanced"), ("Drawing", "intermediate")],
        "wants": ["Python", "Yoga"],
    },
    {
        "email": "frank.obrien@student.edu",
        "first_name": "Frank",
        "last_name": "O'Brien",
        "bio": "Fourth-year. Can grill, code, and overthink in three languages.",
        "availability": "Afternoons",
        "offers": [("Cooking", "advanced"), ("German", "intermediate")],
        "wants": ["Web Development", "Photography"],
    },
    {
        "email": "grace.kim@student.edu",
        "first_name": "Grace",
        "last_name": "Kim",
        "bio": "Yoga instructor in training. Flexible in body and in schedule.",
        "availability": "Mon/Wed/Fri mornings",
        "offers": [("Yoga", "advanced"), ("Korean", "intermediate")],
        "wants": ["Piano", "Public Speaking"],
    },
    {
        "email": "henry.li@student.edu",
        "first_name": "Henry",
        "last_name": "Li",
        "bio": "Math nerd who makes beats on the weekend.",
        "availability": "Tue/Thu evenings",
        "offers": [("Machine Learning", "advanced"), ("Music Production", "intermediate")],
        "wants": ["Spanish", "Tennis"],
    },
    {
        "email": "isla.scott@student.edu",
        "first_name": "Isla",
        "last_name": "Scott",
        "bio": "Marketing student who edits videos and runs at 6am.",
        "availability": "Early mornings",
        "offers": [("Video Editing", "advanced"), ("Running", "intermediate")],
        "wants": ["Graphic Design", "French"],
    },
    {
        "email": "jack.martin@student.edu",
        "first_name": "Jack",
        "last_name": "Martin",
        "bio": "Chess club president. Slow at everything except chess.",
        "availability": "Evenings",
        "offers": [("Chess", "advanced"), ("C++", "intermediate")],
        "wants": ["Guitar", "JavaScript"],
    },
    {
        "email": "kate.smith@student.edu",
        "first_name": "Kate",
        "last_name": "Smith",
        "bio": "Journalism student with a camera and too many opinions.",
        "availability": "Weekends",
        "offers": [("Writing", "advanced"), ("Photography", "advanced")],
        "wants": ["Mandarin", "Video Editing"],
    },
    {
        "email": "leo.garcia@student.edu",
        "first_name": "Leo",
        "last_name": "Garcia",
        "bio": "Swim team, but secretly a web dev. Don't tell the coach.",
        "availability": "Mon/Wed afternoons",
        "offers": [("Swimming", "advanced"), ("React", "intermediate")],
        "wants": ["Data Science", "Italian"],
    },
    {
        "email": "mia.johnson@student.edu",
        "first_name": "Mia",
        "last_name": "Johnson",
        "bio": "Art history major who wants to learn to actually build things.",
        "availability": "Tue/Fri evenings",
        "offers": [("Digital Art", "advanced"), ("Public Speaking", "intermediate")],
        "wants": ["Web Development", "Japanese"],
    },
    {
        "email": "noah.wilson@student.edu",
        "first_name": "Noah",
        "last_name": "Wilson",
        "bio": "Climbs rocks on the weekend, breaks code during the week.",
        "availability": "Weekends, evenings",
        "offers": [("Rock Climbing", "advanced"), ("Linux", "intermediate")],
        "wants": ["Machine Learning", "Guitar"],
    },
]

DEMO_EXCHANGES = [
    ("alice.chen@student.edu", "bob.davis@student.edu", "Python", "Guitar", "accepted"),
    ("bob.davis@student.edu", "alice.chen@student.edu", "Guitar", "Python", "accepted"),
    ("carol.white@student.edu", "diego.ramirez@student.edu", "Graphic Design", "Spanish", "accepted"),
    ("diego.ramirez@student.edu", "carol.white@student.edu", "Spanish", "Web Development", "accepted"),
    ("emma.nguyen@student.edu", "frank.obrien@student.edu", "Excel", "Cooking", "completed"),
    ("frank.obrien@student.edu", "emma.nguyen@student.edu", "Cooking", "Excel", "completed"),
    ("grace.kim@student.edu", "henry.li@student.edu", "Yoga", "Music Production", "completed"),
    ("henry.li@student.edu", "grace.kim@student.edu", "Music Production", "Yoga", "completed"),
    ("isla.scott@student.edu", "jack.martin@student.edu", "Video Editing", "Chess", "completed"),
    ("jack.martin@student.edu", "isla.scott@student.edu", "Chess", "Video Editing", "completed"),
    ("kate.smith@student.edu", "leo.garcia@student.edu", "Writing", "Swimming", "pending"),
    ("leo.garcia@student.edu", "mia.johnson@student.edu", "Swimming", "Digital Art", "pending"),
    ("mia.johnson@student.edu", "noah.wilson@student.edu", "Digital Art", "Rock Climbing", "pending"),
    ("noah.wilson@student.edu", "alice.chen@student.edu", "Rock Climbing", "Python", "cancelled"),
]


class Command(BaseCommand):
    help = "Seed skills, demo users, exchanges and ratings"

    def handle(self, *args, **options):
        if Skill.objects.exists():
            self.stdout.write("Skills already exist — skipping skill seeding.")
        else:
            for name, cat, desc in SKILLS:
                Skill.objects.create(name=name, category=cat, description=desc)
            self.stdout.write(f"Seeded {len(SKILLS)} skills.")

        existing = set(User.objects.values_list("email", flat=True))
        palette = ["#6C5CE7", "#00B894", "#E17055", "#0984E3", "#E84393", "#00CEC9", "#FDCB6E", "#6D214F"]
        user_map = {}
        for i, demo in enumerate(DEMO_USERS):
            if demo["email"] in existing:
                user = User.objects.get(email=demo["email"])
            else:
                user = User.objects.create_user(
                    email=demo["email"],
                    password=demo.get("password", "demo1234"),
                    first_name=demo["first_name"],
                    last_name=demo["last_name"],
                    bio=demo["bio"],
                    availability=demo["availability"],
                    avatar_color=random.choice(palette),
                )
            user_map[demo["email"]] = user
            for name, level in demo["offers"]:
                UserSkill.objects.get_or_create(
                    user=user,
                    skill=Skill.objects.get(name=name),
                    direction="offered",
                    defaults={"proficiency_level": level},
                )
            for name in demo["wants"]:
                UserSkill.objects.get_or_create(
                    user=user,
                    skill=Skill.objects.get(name=name),
                    direction="wanted",
                    defaults={"proficiency_level": "beginner"},
                )

        self.stdout.write(f"Seeded/verified {len(user_map)} demo users.")

        rating_pool = [
            (5, "Patient and super clear teacher."),
            (5, "Explained everything step by step."),
            (4, "Great session, learned a lot."),
            (5, "Would absolutely swap again."),
            (4, "Solid, well-prepared."),
            (3, "Good but we ran a bit long."),
            (5, "Amazing energy, very encouraging."),
            (4, "Covered more than promised."),
        ]
        for proposer_email, recipient_email, offered, wanted, status_ in DEMO_EXCHANGES:
            proposer = user_map[proposer_email]
            recipient = user_map[recipient_email]
            ex = Exchange.objects.filter(
                proposer=proposer, recipient=recipient, skill_offered__name=offered, skill_wanted__name=wanted
            ).first()
            if not ex:
                ex = Exchange.objects.create(
                    proposer=proposer,
                    recipient=recipient,
                    skill_offered=Skill.objects.get(name=offered),
                    skill_wanted=Skill.objects.get(name=wanted),
                    proposed_duration=random.choice([30, 60, 90]),
                    message="Let's find a time that works for both of us!",
                    status=status_,
                )
            if status_ == "completed":
                stars, feedback = random.choice(rating_pool)
                if not Rating.objects.filter(exchange=ex, rater=recipient).exists():
                    Rating.objects.create(exchange=ex, rater=recipient, ratee=proposer, stars=stars, feedback=feedback)
                if not Rating.objects.filter(exchange=ex, rater=proposer).exists():
                    stars2, feedback2 = random.choice(rating_pool)
                    Rating.objects.create(exchange=ex, rater=proposer, ratee=recipient, stars=stars2, feedback=feedback2)

        self.stdout.write(self.style.SUCCESS("Seed complete. Demo login: alice.chen@student.edu / demo1234"))