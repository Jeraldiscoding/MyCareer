import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from crewai_tools import FileWriterTool

# 1. Load the secret keys from the .env file
load_dotenv()
print("Booting up the AI Game Studio...")

# 2. Read the external Game Design Document
try:
    with open('game_design.md', 'r') as file:
        game_context = file.read()
except FileNotFoundError:
    print("Error: Could not find game_design.md. Please create it.")
    exit()

# 3. Equip our Tools
# By leaving the arguments empty, the agent can dynamically specify the file name and content!
file_writer = FileWriterTool()

# ---------------------------------------------------------
# THE AGENTS (Your 4-Person Studio)
# ---------------------------------------------------------
supervisor = Agent(
    role='Lead Game Director',
    goal='Ensure the game meets the scope outlined in the Game Design Document.',
    backstory='You are a strict project manager. You read the design document and assign architectural steps to the team. You ensure the UI and Engine teams don\'t step on each other\'s toes.',
    verbose=True
)

ui_engineer = Agent( # <-- YOUR NEW AGENT
    role='Frontend UI & UX Developer',
    goal='Build the sleek, modern HTML/CSS overlays and ensure NO UI is drawn on the Kaboom canvas.',
    backstory='You are a master of the DOM. You build high-quality, dark-mode dashboards with drop shadows and rounded corners. You write index.html and style.css.',
    verbose=True
)

engine_coder = Agent(
    role='Senior Gameplay Engineer & Tech Artist',
    goal='Write the core Kaboom.js logic and configure the asset manager.',
    backstory='You write modular ES6 JavaScript (overworld.js, finance.js). You also write the loadSpriteAtlas configurations, ALWAYS ensuring the magenta transparency fix (transColor: rgb(255, 0, 255)) is applied.',
    verbose=True
)

qa_deployer = Agent(
    role='QA Reviewer & Release Engineer',
    goal='Audit the generated code, fix syntax bugs, and write the final files to the hard drive.',
    backstory='You are the final gatekeeper. You review the HTML, CSS, and JS. Once perfectly integrated, you use your file writing tool to create the actual files (index.html, style.css, overworld.js, etc.) in the project directory.',
    verbose=True,
    tools=[file_writer] # The agent has hands to write files
)

# ---------------------------------------------------------
# THE TASKS
# ---------------------------------------------------------
plan_task = Task(
    description=f'Read this Context: {game_context}. Create a comprehensive file architecture plan for the UI layer and the Overworld/Finance modules.',
    expected_output='A bulleted list of files to be created and their exact responsibilities.',
    agent=supervisor
)

ui_task = Task(
    description='Based on the plan, write the complete index.html and style.css code. Ensure the #ui-layer is absolutely positioned over the game canvas and includes the Wealth/Energy dashboard.',
    expected_output='The complete HTML and CSS source code.',
    agent=ui_engineer
)

engine_task = Task(
    description='Based on the plan and UI structure, write the JavaScript files (asset-manager.js, globals.js, overworld.js, and finance.js). Connect global variables to the HTML DOM IDs created by the UI Engineer.',
    expected_output='The complete JavaScript source code for the engine and modules.',
    agent=engine_coder
)

deploy_task = Task(
    description='Review all code. Ensure Kaboom v3 syntax is correct and the magenta fix is present. Use your FileWriteTool to create and save index.html, style.css, and all the JavaScript files to the current directory.',
    expected_output='A confirmation log stating which files were successfully written to the hard drive.',
    agent=qa_deployer
)

# ---------------------------------------------------------
# THE CREW
# ---------------------------------------------------------
game_studio = Crew(
    agents=[supervisor, ui_engineer, engine_coder, qa_deployer],
    tasks=[plan_task, ui_task, engine_task, deploy_task],
    process=Process.sequential
)

# Execute
result = game_studio.kickoff()
print("==========================================")
print("DEPLOYMENT COMPLETE:")
print("==========================================")
print(result)