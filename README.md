# Microservice e-commerce app
![build](https://github.com/actions/hello-world/workflows/.github/workflows/deploy-auth.yml/badge.svg)
An e-commerce application for buying and selling of tickets written in **Nodejs** (typescript) and **express** and using **Kubernetes** and **Docker** for deployments and using **NATS Streaming** for inter-service communication and **Github Actions** for automated integration and deployments. 

## Services:

1. **Authentication** (sarthakjha/auth): User authentication service using **express-session** for session management and **mongodb** for persistance.

This service manages all forms of authentication that is required including protecting the routes and other stuff.

2. **Orders** (sarthakjha/orders):
This service manages ticket orders placed by the user and makes sure order is only valid within the expiration time. The order is blocked for the user for a specific time limit. 

The order will be terminated if payment is not carried out in the given interval. Uses **mongodb** for persistance.

3. **Tickets** (sarthakjha/tickets):
Manages tickets placed for sale by the user. Uses **mongodb** for persistance.

4. **Payments** (sarthakjha/payments):
Manages payments for the orderd placed by user. Uses **Stripe API** for debit/credit card transactions and mongodb for payment records.

5. **Expiration** (sarthakjha/expiration):
An order can only be placed for a specific amount of time. 

If payment is not done in between the specific time limit, the order will be terminated.

Uses **bullJS** with **redis** for managing the expiration task queues.

6. **Client** (sarthakjha/expiration):
Basic front-end client written in ReactJs and NextJs
****

## NATS Streaming
All the inter-service communication takes place using NATS Streaming by publishing and subscribing to events.

****
## @ticketingsarthak/common 

[TicketX_Common](https://github.com/SarthakJha/TicketX_common) is a
**npm** library written in typescript for packaging common code among all the services to avoid repetion of code as much as possible. To install, use:

`npm i @ticketingsarthak/common`

****
## Testing
All tests are written using **jest** framework and **supertest** library. **Comprehensive tests** are written for all the services to avoid manual testing of indivisual routes as much as possible. To test the service, change directory and run :

`npm test`
****

## CI/CD
**Continuous integration pipeline** gets triggered on any pull request on the master branch. The code is tested to see if the application is not broken and if the build passes, it can merged to the master branch.

New push/commit on the master branch triggers **Continuous deployment pipeline** which build the a docker image of the service and pushes it to the container registry (**Docker Hub**).



