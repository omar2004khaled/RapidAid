be:
    cd backend && mvn spring-boot:run
fe:
    cd frontend && npm run dev -- --open

setup:
    cd frontend && npm install && npm install leaflet react-leaflet axios