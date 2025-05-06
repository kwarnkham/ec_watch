#!/bin/bash
export installer='dnf'
export ip='18.140.60.118'
export name='AWS'
export botUrl='https://admin.ctests.xyz/send'
export botSecret=""
export botUserId="1"
export botGroupId="-4693903019"
export easyCloudUrl='https://cloud-manager.ctests.xyz/api'
export serverId='1'

sudo $installer update -y
sudo $installer upgrade -y

sudo $installer install sysstat procps -y

#nginx
sudo $installer install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

#certbot
sudo $installer install certbot -y
sudo $installer install python3-certbot-nginx -y

#nodejs
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"                   # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion

nvm install 22.14.0

#git
sudo $installer install git -y
rm -rf $HOME/ec_watch
git clone https://github.com/kwarnkham/ec_watch.git $HOME/ec_watch

#server
npm install --prefix $HOME/ec_watch
npm install -g pm2

MY_IP=$ip NAME="$name" EASY_CLOUD_URL=$easyCloudUrl SERVER_ID=$serverId URL=$botUrl SECRET=$botSecret USER_ID=$botUserId GROUP_ID=$botGroupId pm2 start $HOME/ec_watch/server.js --name server --output /dev/null --error /dev/null

pm2 startup

sudo env PATH=$PATH:$HOME/.nvm/versions/node/v22.14.0/bin $HOME/.nvm/versions/node/v22.14.0/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

pm2 save
