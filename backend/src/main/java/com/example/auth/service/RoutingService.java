package com.example.auth.service;

import com.example.auth.entity.Vehicle;
import com.example.auth.enums.VehicleType;
import com.graphhopper.GHRequest;
import com.graphhopper.GHResponse;
import com.graphhopper.GraphHopper;
import com.graphhopper.ResponsePath;
import com.graphhopper.util.PointList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class RoutingService {

    @Autowired
    private GraphHopper graphHopper;

    public RouteResult findOptimalRoute(BigDecimal fromLat, BigDecimal fromLng, 
                                       BigDecimal toLat, BigDecimal toLng, 
                                       VehicleType vehicleType) {
        String profile = getProfileForVehicleType(vehicleType);
        return calculateRoute(fromLat, fromLng, toLat, toLng, profile);
    }

    public RouteResult findRoute(BigDecimal fromLat, BigDecimal fromLng, 
                                BigDecimal toLat, BigDecimal toLng) {
        return calculateRoute(fromLat, fromLng, toLat, toLng, "emergency");
    }

    public RouteResult findRouteForVehicle(Vehicle vehicle, BigDecimal toLat, BigDecimal toLng) {
        if (vehicle.getLastLatitude() == null || vehicle.getLastLongitude() == null) {
            throw new RuntimeException("Vehicle location not available");
        }
        
        String profile = getProfileForVehicleType(vehicle.getVehicleType());
        return calculateRoute(vehicle.getLastLatitude(), vehicle.getLastLongitude(), 
                            toLat, toLng, profile);
    }

    private RouteResult calculateRoute(BigDecimal fromLat, BigDecimal fromLng, 
                                     BigDecimal toLat, BigDecimal toLng, String profile) {
        try {
            // Snap coordinates to nearest roads
            double[] snappedFrom = snapToRoad(fromLat.doubleValue(), fromLng.doubleValue());
            double[] snappedTo = snapToRoad(toLat.doubleValue(), toLng.doubleValue());
            
            GHRequest request = new GHRequest(
                snappedFrom[0], snappedFrom[1],
                snappedTo[0], snappedTo[1]
            );
            request.setProfile(profile);
            
            GHResponse response = graphHopper.route(request);
            
            if (response.hasErrors()) {
                throw new RuntimeException("Routing error: " + response.getErrors());
            }
            
            ResponsePath path = response.getBest();
            PointList pointList = path.getPoints();
            
            List<RoutePoint> routePoints = new ArrayList<>();
            for (int i = 0; i < pointList.size(); i++) {
                routePoints.add(new RoutePoint(
                    BigDecimal.valueOf(pointList.getLat(i)),
                    BigDecimal.valueOf(pointList.getLon(i))
                ));
            }
            
            return new RouteResult(
                routePoints,
                path.getDistance() / 1000.0,
                path.getTime() / 1000.0
            );
        } catch (Exception e) {
            // Fallback to straight line if routing fails
            List<RoutePoint> fallbackPoints = new ArrayList<>();
            fallbackPoints.add(new RoutePoint(fromLat, fromLng));
            fallbackPoints.add(new RoutePoint(toLat, toLng));
            
            double distance = calculateDistance(fromLat.doubleValue(), fromLng.doubleValue(), 
                                              toLat.doubleValue(), toLng.doubleValue());
            double time = distance * 60; // Assume 1 km/min speed
            
            return new RouteResult(fallbackPoints, distance, time);
        }
    }
    
    private double[] snapToRoad(double lat, double lng) {
        try {
            // Use GraphHopper's map matching to snap to nearest road
            GHRequest request = new GHRequest(lat, lng, lat, lng);
            request.setProfile("emergency");
            GHResponse response = graphHopper.route(request);
            
            if (!response.hasErrors() && response.getBest() != null) {
                PointList points = response.getBest().getPoints();
                if (points.size() > 0) {
                    return new double[]{points.getLat(0), points.getLon(0)};
                }
            }
        } catch (Exception e) {
            // Ignore snapping errors
        }
        
        // Return original coordinates if snapping fails
        return new double[]{lat, lng};
    }
    
    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private String getProfileForVehicleType(VehicleType vehicleType) {
        return "emergency";
    }

    public static class RouteResult {
        private final List<RoutePoint> points;
        private final double distanceKm;
        private final double timeSeconds;

        public RouteResult(List<RoutePoint> points, double distanceKm, double timeSeconds) {
            this.points = points;
            this.distanceKm = distanceKm;
            this.timeSeconds = timeSeconds;
        }

        public List<RoutePoint> getPoints() { return points; }
        public double getDistanceKm() { return distanceKm; }
        public double getTimeSeconds() { return timeSeconds; }
        public double getTimeMinutes() { return timeSeconds / 60.0; }
    }

    public static class RoutePoint {
        private final BigDecimal latitude;
        private final BigDecimal longitude;

        public RoutePoint(BigDecimal latitude, BigDecimal longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public BigDecimal getLatitude() { return latitude; }
        public BigDecimal getLongitude() { return longitude; }
    }
}