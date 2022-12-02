## OpenL Demo Server

Production deployment for internal http://mnsopenl.exigengroup.com/ server.

```shell
# Compile production code bundle
yarn build

# Then go to `/dist/web`
cd ../../dist/web

# and deploy:
git add .
git commit -m "v0.x.x"
git push

# Wait for at least 2 minutes for the cron job, 
# then go to http://mnsopenl.exigengroup.com/
# and clear browser cache with Ctrl/Command + Shift + R in Chrome browser.
```
