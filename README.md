# About The Project
Build, deploy and scale a back end system to support the Ratings & Reviews microservice of an E-Commerce platform.

## Built With
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=PostgreSQL&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white)
![NGINX](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

## System Design Diagrams (created using [draw.io](https://www.drawio.com/))
• Diagram for GET requests:
![GET](./system_design_graphs/GET-diagram.png)
• Diagram for POST requests:
![POST](./system_design_graphs/POST-diagram.png)

## Thought Process & Results
### **Phase 1 (Sep 20, 2022 - Nov 30, 2022)**
When I started, I only focused on speeding up GET requests. There are over 20M records related to Reviews & Ratings in my database. How do I allow users to fetch their data quickly? In addition to optimizing SQL queries, I made the decision to use PostgreSQL Materialized views and a horizontal scaling strategy: load balancing. After creating two Materialized views, users could fetch data from the cache results instead of getting them from tables. These changes increased my RPS (Requests Per Second) numbers, while maintaining a low error rate (<1%) and low latency (<150ms). Here is a comparasion: 
<br> 

***Before Deployment (initial results without any optimization)*** :
<p align="left">
    <img height="340" alt="localhost-result-GET-reviews" src="https://github.com/daz-sdc/sdc-reviews/assets/77268619/b666da41-47e7-4e17-8878-eb5e2cc5b04b" />
    <img height="340" alt="localhost-result-GET-reviews-metadata" src="https://github.com/daz-sdc/sdc-reviews/assets/77268619/a2108860-ec08-422d-b22f-0ef1aab2daec" />
</p>

  You can see from the above records, both GET requests were super slow: 
  * For GET /reviews, the average response times were over 6s per request.
  * For GET /reviews/meta, the average response times were over 12s per request.

***After Deploying on AWS (Strategy: SQL query optimization + Materialized views + Load balancer)*** :
<p align="left">
    <img height="500" alt="Deployed-GET-reviews" src="https://github.com/daz-sdc/sdc-reviews/assets/77268619/a38746aa-20d7-45b6-a761-00d7c0023619" />
    <img height="500" alt="Deployed-GET-reviews-metadata" src="https://github.com/daz-sdc/sdc-reviews/assets/77268619/955c0d48-d138-467b-a24a-2ee0d09568ac" />
</p>

  After database tuning and horizontal scaling, both GET requests sped up significantly:
  * For GET /reviews, the application could handle 2700 RPS.
  * For GET /reviews/meta, the application could handle 2800 RPS.

### **Phase 2 (July 27, 2023 - Present)**
I will attach results soon :)
