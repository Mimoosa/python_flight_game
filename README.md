# Flight Game

This project was developed during the first year of studies using **Python, JavaScript, CSS, and HTML**.  
It is a flight simulation game where the player is given an initial flight distance and can travel between airports until the distance reaches zero.

## Game Concept
- The player starts at a random airport with a set amount of flight distance.  
- From each airport, the player can choose a destination among **three types of airports**:
  - Large airport  
  - Medium airport  
  - Small airport  
- The **score gained depends on the size of the airport** visited.  
- Weather conditions at the destination are fetched via the **OpenWeatherMap API**.  
  - If the weather is bad, the actual flight distance consumed increases by a percentage penalty.  

## Features
- Real-time weather integration affecting gameplay  
- Dynamic scoring system based on airport size  
- Database storage of final scores  
- The **Scores page** displays a ranking of players based on the scores stored locally.  

## Tech Stack
- **Python**: Backend logic and database interaction  
- **JavaScript**: Frontend interactivity  
- **CSS & HTML**: User interface and styling  
- **OpenWeatherMap API**: Real-time weather data  
- **Database**: Stores scores and rankings  

---

This project demonstrates combining web technologies with external APIs and databases to create an interactive and educational game experience.

## About Page
<img width="1904" height="953" alt="Screenshot 2025-11-27 163456" src="https://github.com/user-attachments/assets/b5e403d4-9354-4ab7-b5e1-91e48b464b60" />

##　Players select from three airport types, influencing both score and remaining flight distance.
<img width="1901" height="939" alt="Screenshot 2025-11-27 163943" src="https://github.com/user-attachments/assets/b52e9401-9b2b-42ce-9ca3-3103cf750532" />

## Selecting the next destination airport to continue the journey
<img width="1893" height="912" alt="Screenshot 2025-11-27 164054" src="https://github.com/user-attachments/assets/64fea30e-e7b2-4344-affb-1396ab37bbf6" />

## Weather conditions increase the distance cost of the flight
<img width="1896" height="916" alt="Screenshot 2025-11-27 164248" src="https://github.com/user-attachments/assets/47372594-8161-4b42-8ad7-69f6c035260f" />

## Scores Page
<img width="1896" height="892" alt="Screenshot 2025-11-27 164322" src="https://github.com/user-attachments/assets/6eedd60e-af9e-496d-9d76-9e013cdad65e" />





