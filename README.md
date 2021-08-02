##Введение

Умный дом выполнен на устройствах Sonoff, Orangepi, Колонка Yandex Алиса.

##Настройки устройств

Внешний интернет адрес текущего роутера: XXXX.sn.mynetname.net (смотреть в роутере в разделе IP/Cloud)
Управляющие устройства
Домашняя сеть - роутер Mikrotik, адрес 192.168.0.1.
Управляющее устройство - Orange Pi One 192.168.0.57 (новый sbc = 192.168.0.116), доступ по ssh по 22 порту, plotn/3....
Серверное приложение развернуто в: /opt/cleverNest, настроено на порт 8086, на роутере также настроен проброс портов 8086 - 8086.
База данных (H2) серверного приложения лежит: /home/plotn/Projects/plotnCleverNest/db/clever_nest_db
Приложение настроено как сервис, конфигурационный файл лежит: /etc/systemd/system/cleverNest.service
Запуск и остановка: sudo systemctl [start|stop|status] cleverNest.service
Прописать в автостарт при ребуте: sudo systemctl enable cleverNest.service
Логи приложения - либо смотреть в соответствующей папке в /opt, либо sudo journalctl -u cleverNest.service
Клиентское приложение (react) развернуто на Nginx в /var/www/plotnNest, хостится на порту 8085 (проброс портов также настроен). Конфигурационный файл: /etc/nginx/conf.d
Старт, остановка, статус: sudo systemctl start nginx. Не забыть прописать автозапуск (enable) 

Доступ пользователей осуществляется по JWT-токенам.
Для “Алисы” настроен веб-хук с постоянным паролем (по умолчанию YYY), пользователь с идентификатором -1.

Настройка Алисы осуществляется через навык “Домовенок Кузя”. Настройка устройств - в самом “домовенке” тут: https://alexstar.ru/smarthome

Нюансы настройки. Устройства домовенка появляются как устройства Алисы, однако чтобы обновить перечень нужно зайти в “Добавить устройство”, в качестве производителя выбрать “Домовенка” и нажать “обновить устройства”. Также в “Алисе” нужно переименовать устройства соответствующим образом, настроить команды.  
Активные устройства
http://192.168.0.56/ - 4-канальный переключатель Sonoff 4ch pro, доступ admin/3....
Команды: 
http://192.168.0.56/control?cmd=status,gpio,12 - статус;
http://192.168.0.56/control?cmd=GPIO,12,1 - включение или выключение.
Номера пинов: 
GPIO12	Relay + LED Channel 1
GPIO5		Relay + LED Channel 2
GPIO4		Relay + LED Channel 3
GPIO15	Relay + LED Channel 4

http://192.168.0.34/ - умная розетка Sonoff S26, доступ admin/3....
Номера пинов: 
GPIO12
Среды разработки
Собрать проект React: sudo npm run build

## Стандартное реактовское ридми - на всякий случай:

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
