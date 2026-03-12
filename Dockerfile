FROM node:20-alpine AS deps
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

FROM node:20-alpine AS runtime
RUN apk update && apk upgrade && apk add --no-cache tini && rm -rf /var/cache/apk/*
ENV NODE_ENV=production
LABEL org.opencontainers.image.title="j-finance-commission-backend" \
  org.opencontainers.image.vendor="Aadrika Enterprises"
RUN addgroup -g 1001 -S dockeruser && adduser -S dockeruser -u 1001 -G dockeruser
WORKDIR /app
COPY --chown=dockeruser:dockeruser --from=deps /app/node_modules ./node_modules
COPY --chown=dockeruser:dockeruser . .
USER dockeruser
EXPOSE 6010
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "(async()=>{try{const r=await fetch('http://localhost:6010/');if(!r.ok)throw 1;process.exit(0)}catch{process.exit(1)}})()"]
ENTRYPOINT ["tini", "--"]
CMD ["node", "src/app.js"]
