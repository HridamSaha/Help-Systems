package com.example.helpsystems.serviceimpl;

import com.example.helpsystems.enums.Department;
import com.example.helpsystems.util.EncryptionUtil;
import com.example.helpsystems.dto.HelpRequestDTO;
import com.example.helpsystems.entity.HelpRequest;
import com.example.helpsystems.repository.HelpRequestRepository;
import com.example.helpsystems.repository.ResourceRepository;
import com.example.helpsystems.service.HelpRequestService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class HelpRequestServiceImpl implements HelpRequestService {

    private final HelpRequestRepository helpRequestRepository;
    private final ResourceRepository resourceRepository;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ml.service.url:http://localhost:5000}")
    private String mlServiceUrl;

    public HelpRequestServiceImpl(HelpRequestRepository helpRequestRepository,
                                  ResourceRepository resourceRepository) {
        this.helpRequestRepository = helpRequestRepository;
        this.resourceRepository = resourceRepository;
    }

    // ── ML-based urgency (calls Flask) ────────────────────────────────────────
    private static class MlResult {
        String urgency;
        double confidence;
        String source;
    }

    private MlResult callMlService(String message) {
        try {
            String body = objectMapper.writeValueAsString(
                    java.util.Map.of("message", message)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(mlServiceUrl + "/predict"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .timeout(java.time.Duration.ofSeconds(5))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString()
            );

            JsonNode json = objectMapper.readTree(response.body());
            MlResult result = new MlResult();
            result.urgency    = json.get("urgency").asText("LOW");
            result.confidence = json.get("confidence").asDouble(0.0);
            result.source     = json.get("source").asText("model");
            return result;

        } catch (Exception e) {
            // ML service unavailable — fall back to keyword detection
            System.err.println("ML service unavailable, using keyword fallback: " + e.getMessage());
            return null;
        }
    }

    // ── Keyword fallback (runs only if ML service is down) ───────────────────
    private String detectUrgencyFallback(String message) {
        if (message == null) return "LOW";
        String msg = message.toLowerCase();

        // ── CRITICAL ──────────────────────────────────────────────────────────────
        // English
        if (msg.contains("rapes") || msg.contains("murder") || msg.contains("kill") ||
                msg.contains("acid") || msg.contains("stab") || msg.contains("trafficking") ||
                msg.contains("gang rape") || msg.contains("kidnap") || msg.contains("death threat") ||
                msg.contains("forced sex") || msg.contains("molest")) {
            return "CRITICAL";
        }
        // Hindi
        if (msg.contains("बलात्कार") || msg.contains("हत्या") || msg.contains("तेज़ाब") ||
                msg.contains("दहेज") || msg.contains("बंद करके") || msg.contains("चाकू") ||
                msg.contains("जबरदस्ती") || msg.contains("अपहरण")) {
            return "CRITICAL";
        }
        // Tamil
        if (msg.contains("பாலியல்") || msg.contains("கொலை") || msg.contains("அமிலம்") ||
                msg.contains("கடத்தல்") || msg.contains("வன்கொடுமை")) {
            return "CRITICAL";
        }
        // Telugu
        if (msg.contains("అత్యాచారం") || msg.contains("హత్య") || msg.contains("బంధించి") ||
                msg.contains("బలవంతంగా") || msg.contains("కత్తి") || msg.contains("కిడ్నాప్")) {
            return "CRITICAL";
        }

        // ── HIGH ──────────────────────────────────────────────────────────────────
        // English
        if (msg.contains("harass") || msg.contains("threaten") || msg.contains("blackmail") ||
                msg.contains("stalk") || msg.contains("sexual favour") || msg.contains("sexual favor") ||
                msg.contains("sexual harassment") || msg.contains("sex for job") ||
                msg.contains("sleep with") || msg.contains("forced marriage") ||
                msg.contains("leaked") || msg.contains("nude") || msg.contains("unsafe")) {
            return "HIGH";
        }
        // Hindi
        if (msg.contains("धमकी") || msg.contains("परेशान") || msg.contains("पीछा") ||
                msg.contains("ब्लैकमेल") || msg.contains("यौन उत्पीड़न") || msg.contains("छेड़छाड़") ||
                msg.contains("असुरक्षित")) {
            return "HIGH";
        }
        // Tamil
        if (msg.contains("மிரட்டல்") || msg.contains("தொந்தரவு") || msg.contains("பின்தொடர்") ||
                msg.contains("பாலியல் தொல்லை") || msg.contains("பாதுகாப்பற்ற")) {
            return "HIGH";
        }
        // Telugu
        if (msg.contains("బెదిరింపు") || msg.contains("వేధింపు") || msg.contains("వెంబడించు") ||
                msg.contains("లైంగిక వేధింపు") || msg.contains("అసురక్షిత")) {
            return "HIGH";
        }

        // ── MEDIUM ────────────────────────────────────────────────────────────────
        if (msg.contains("help") || msg.contains("fear") || msg.contains("worried") ||
                msg.contains("uncomfortable") || msg.contains("trouble") || msg.contains("problem") ||
                msg.contains("मदद") || msg.contains("डर") || msg.contains("உதவி") ||
                msg.contains("సహాయం")) {
            return "MEDIUM";
        }

        return "LOW";
    }

    // ── Department detection (still rule-based, but multilingual) ────────────
    private Department detectDepartment(String message) {
        if (message == null) return Department.POLICE_GENERAL;
        String msg = message.toLowerCase();

        // Cyber
        if (msg.contains("online") || msg.contains("cyber") || msg.contains("blackmail") ||
                msg.contains("hack") || msg.contains("leaked") ||
                msg.contains("ब्लैकमेल") || msg.contains("மிரட்டு") || msg.contains("బ్లాక్‌మెయిల్")) {
            return Department.CYBER_CRIME;
        }

        // Child protection
        if (msg.contains("child") || msg.contains("minor") || msg.contains("kid") ||
                msg.contains("बच्चे") || msg.contains("குழந்தை") || msg.contains("పిల్లలు")) {
            return Department.CHILD_PROTECTION;
        }

        // Domestic violence
        if (msg.contains("husband") || msg.contains("domestic") || msg.contains("violence") ||
                msg.contains("पति") || msg.contains("கணவர்") || msg.contains("భర్త") ||
                msg.contains("दहेज") || msg.contains("ससुराल")) {
            return Department.DOMESTIC_VIOLENCE;
        }

        // Women safety / stalking
        if (msg.contains("harassment") || msg.contains("stalking") || msg.contains("follow") ||
                msg.contains("परेशान") || msg.contains("பின்தொடர்") || msg.contains("వేధింపు")) {
            return Department.WOMEN_SAFETY;
        }

        // Emergency
        if (msg.contains("bleeding") || msg.contains("attack") || msg.contains("urgent") ||
                msg.contains("rape") || msg.contains("बलात్కार") || msg.contains("అత్యాచారం")) {
            return Department.EMERGENCY_RESPONSE;
        }

        return Department.POLICE_GENERAL;
    }

    // ── Map ML urgency string to your internal format ────────────────────────
    private String normalizeUrgency(String mlUrgency) {
        return switch (mlUrgency.toUpperCase()) {
            case "CRITICAL" -> "CRITICAL";
            case "HIGH"     -> "HIGH";
            case "MEDIUM"   -> "MEDIUM";
            default         -> "LOW";
        };
    }

    // ── Geo-fencing routing ───────────────────────────────────────────────────
    private String assignAuthority(String issueType, String area) {
        var list = resourceRepository.findByIssueTypeAndArea(issueType, area);
        if (!list.isEmpty()) return list.get(0).getResourceName();

        var fallback = resourceRepository.findByIssueType(issueType);
        if (!fallback.isEmpty()) return fallback.get(0).getResourceName();

        return "NOT_ASSIGNED";
    }

    @Override
    public HelpRequest submitRequest(HelpRequestDTO dto) {

        HelpRequest request = new HelpRequest();
        request.setRequestId("REQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        request.setIssueType(dto.getIssueType());

        String finalMessage = dto.getMessage();

        request.setMessage((finalMessage));
        request.setLanguage(dto.getLanguage());
        request.setLocationArea(dto.getLocationArea());
        request.setLatitude(dto.getLatitude());
        request.setLongitude(dto.getLongitude());
     //new
        request.setDepartment(detectDepartment(finalMessage));
        request.setAssignedAuthority(assignAuthority(dto.getIssueType(), dto.getLocationArea()));

// 🔥 ADD THIS BLOCK HERE
     //   String group = assignPoliceGroup(request.getUrgencyLevel());
      //  request.setPoliceGroup(group);

        request.setStatus("SUBMITTED");
        request.setCreatedAt(LocalDateTime.now());
       // request.setStatus("SUBMITTED");

        //return helpRequestRepository.save(request);
        // ── ML urgency with keyword fallback ─────────────────────────────────
        MlResult mlResult = callMlService(finalMessage);
        if (mlResult != null) {
            request.setUrgencyLevel(normalizeUrgency(mlResult.urgency));
        } else {
            request.setUrgencyLevel(detectUrgencyFallback(finalMessage));
        }
        //  String group = assignPoliceGroup(request.getUrgencyLevel());
       String group = assignPoliceGroup(request.getUrgencyLevel()); request.setPoliceGroup(group);
        request.setDepartment(detectDepartment(finalMessage));
        request.setAssignedAuthority(assignAuthority(dto.getIssueType(), dto.getLocationArea()));
        request.setStatus("SUBMITTED");
        request.setCreatedAt(LocalDateTime.now());

        return helpRequestRepository.save(request);
    }
    private double policeLat = 12.9692;
    private double policeLng = 79.1559;

   /* @Override
    public HelpRequest trackRequest(String requestId) {
        // return helpRequestRepository.findByRequestId(requestId)
        //     .orElseThrow(() -> new RuntimeException("Request ID not found"));
        HelpRequest req = helpRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Request ID not found"));

        double userLat = req.getLatitude();
        double userLng = req.getLongitude();

        double offset = 0.0009;

        double policeLat = userLat +  offset;
        double policeLng = userLng + offset;

        // 🚓 Move police towards user
        policeLat += (userLat - policeLat) * 0.05;
        policeLng += (userLng - policeLng) * 0.05;

        req.setPoliceLat(policeLat);
        req.setPoliceLng(policeLng);

        // 📏 Distance check
        double distance = Math.sqrt(
                Math.pow(userLat - policeLat, 2) +
                        Math.pow(userLng - policeLng, 2)
        );

        // ✅ Auto resolve when reached
        if (distance < 0.0005) {
            req.setStatus("RESOLVED");
        } else {
            req.setStatus("IN_PROGRESS");
        }

        return helpRequestRepository.save(req);
    }*/
    @Override
    public HelpRequest trackRequest(String requestId) {

        HelpRequest req = helpRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Request ID not found"));

        double userLat = req.getLatitude();
        double userLng = req.getLongitude();

        Double policeLat = req.getPoliceLat();
        Double policeLng = req.getPoliceLng();

        // 🚓 FIRST TIME → initialize 5 km away
        if (policeLat == null || policeLng == null) {
            policeLat = userLat + 0.045;
            policeLng = userLng + 0.045;
        }
        else {
            // 🚓 MOVE toward user (important part)
            double step = 0.001;

            policeLat = policeLat + (userLat - policeLat) * 0.1;
            policeLng = policeLng + (userLng - policeLng) * 0.1;
        }

        req.setPoliceLat(policeLat);
        req.setPoliceLng(policeLng);

        return helpRequestRepository.save(req);
    }
   @Override
    public HelpRequest updateStatus(String requestId, String status) {
        HelpRequest request = trackRequest(requestId);
        request.setStatus(status);
        request.setUpdatedAt(LocalDateTime.now());

      //  if ("ACTION_TAKEN".equals(status)) {
            //    long minutes = java.time.Duration
            //             .between(request.getCreatedAt(), LocalDateTime.now())
            //              .toMinutes();
            //    request.setResponseTimeMinutes(minutes);
            //  }

            if ("RESOLVED".equalsIgnoreCase(status)) {
                request.setResolvedAt(LocalDateTime.now());

                long minutes = java.time.Duration
                        .between(request.getCreatedAt(), request.getResolvedAt())
                        .toMinutes();

                request.setResponseTimeMinutes(minutes);
            }

            return helpRequestRepository.save(request);
        }

    @Override
    public HelpRequest reassign(String requestId, String authority) {

        HelpRequest request = trackRequest(requestId);

        request.setAssignedAuthority(authority);

        return helpRequestRepository.save(request);
    }
    @Override
    public HelpRequest assignRequest(String requestId) {

        Optional<HelpRequest> optional = helpRequestRepository.findByRequestId(requestId);

        if (optional.isPresent()) {

            HelpRequest req = optional.get();
            String group = assignPoliceGroup(req.getUrgencyLevel());
            req.setPoliceGroup(group);
            // 🚓 SET POLICE LOCATION (VERY IMPORTANT)
            req.setPoliceLat(req.getLatitude() - 0.01);
            req.setPoliceLng(req.getLongitude() - 0.01);


            req.setStatus("IN_PROGRESS");

            return helpRequestRepository.save(req);
        }

        throw new RuntimeException("Request not found");
    }
        @Override
        public List<HelpRequest> getAllRequests () {
            return helpRequestRepository.findAll();
        }

    @Override
    public HelpRequest resolveRequest(String requestId) {

        HelpRequest req = trackRequest(requestId);

        req.setStatus("RESOLVED");
        req.setResolvedAt(java.time.LocalDateTime.now());

        return helpRequestRepository.save(req);
    }
    private String assignPoliceGroup(String urgency) {

        if (urgency == null) return "POLICE_GENERAL";

        switch (urgency.toUpperCase()) {

            case "CRITICAL":
                return "POLICE_SPECIAL_UNIT";

            case "HIGH":
                return "POLICE_FAST_RESPONSE";

            case "MEDIUM":
                return "POLICE_LOCAL_PATROL";

            case "LOW":
                return "POLICE_GENERAL";

            default:
                return "POLICE_GENERAL";
        }
    }
    }
