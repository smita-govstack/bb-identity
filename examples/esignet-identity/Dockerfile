FROM node:14-alpine

RUN npm install -g @mockoon/cli@2.2.1
COPY esignet-bbidentity.json ./esignet-bbidentity.json

COPY entrypoint.sh ./entrypoint.sh
# Do not run as root.
RUN adduser --shell /bin/sh --disabled-password --gecos "" esignet
RUN chown -R esignet ./esignet-bbidentity.json
RUN chown -R esignet ./entrypoint.sh

USER esignet

EXPOSE 3001

RUN ls

ENTRYPOINT ["/entrypoint.sh"]
