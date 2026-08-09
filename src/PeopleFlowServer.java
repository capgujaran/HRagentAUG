import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PeopleFlowServer {
    private static final List<Employee> employees = new ArrayList<>(List.of(
        new Employee(1, "Maya Patel", "Product Designer", "Product", "Dubai", "MP", "Active"),
        new Employee(2, "Omar Hassan", "Engineering Lead", "Engineering", "Abu Dhabi", "OH", "Active"),
        new Employee(3, "Sofia Reyes", "People Partner", "People", "Remote", "SR", "On leave"),
        new Employee(4, "Noah Williams", "Finance Analyst", "Finance", "Dubai", "NW", "Active"),
        new Employee(5, "Aisha Rahman", "Frontend Engineer", "Engineering", "Remote", "AR", "Active"),
        new Employee(6, "Liam Chen", "Growth Manager", "Marketing", "Dubai", "LC", "Active")
    ));

    private static final List<Leave> leaves = new ArrayList<>(List.of(
        new Leave(1, "Sofia Reyes", "Annual leave", "12–16 Aug", "5 days", "Pending", "SR"),
        new Leave(2, "Omar Hassan", "Personal leave", "19 Aug", "1 day", "Pending", "OH"),
        new Leave(3, "Aisha Rahman", "Annual leave", "25–27 Aug", "3 days", "Approved", "AR")
    ));

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/api/employees", PeopleFlowServer::handleEmployees);
        server.createContext("/api/leaves", PeopleFlowServer::handleLeaves);
        server.createContext("/api/health", exchange -> send(exchange, 200, "application/json", "{\"status\":\"ok\"}"));
        server.createContext("/", PeopleFlowServer::serveStatic);
        server.setExecutor(Executors.newFixedThreadPool(8));
        server.start();
        System.out.println("PeopleFlow HR started at http://localhost:8080");
    }

    private static void handleEmployees(HttpExchange exchange) throws IOException {
        if ("GET".equals(exchange.getRequestMethod())) {
            synchronized (employees) { send(exchange, 200, "application/json", employeesJson()); }
            return;
        }
        if ("POST".equals(exchange.getRequestMethod())) {
            String body = readBody(exchange);
            String name = value(body, "name");
            String role = value(body, "role");
            String department = value(body, "department");
            String location = value(body, "location");
            if (name.isBlank() || role.isBlank() || department.isBlank()) {
                send(exchange, 400, "application/json", "{\"error\":\"Name, role and department are required\"}");
                return;
            }
            Employee employee;
            synchronized (employees) {
                int id = employees.stream().mapToInt(Employee::id).max().orElse(0) + 1;
                employee = new Employee(id, name, role, department, location.isBlank() ? "Dubai" : location, initials(name), "Active");
                employees.add(employee);
            }
            send(exchange, 201, "application/json", employeeJson(employee));
            return;
        }
        send(exchange, 405, "application/json", "{\"error\":\"Method not allowed\"}");
    }

    private static void handleLeaves(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        if ("GET".equals(exchange.getRequestMethod()) && path.equals("/api/leaves")) {
            synchronized (leaves) { send(exchange, 200, "application/json", leavesJson()); }
            return;
        }
        if ("PATCH".equals(exchange.getRequestMethod())) {
            Matcher matcher = Pattern.compile("/api/leaves/(\\d+)").matcher(path);
            String status = value(readBody(exchange), "status");
            if (matcher.matches() && (status.equals("Approved") || status.equals("Rejected"))) {
                int id = Integer.parseInt(matcher.group(1));
                synchronized (leaves) {
                    for (int i = 0; i < leaves.size(); i++) {
                        Leave item = leaves.get(i);
                        if (item.id() == id) {
                            Leave updated = new Leave(item.id(), item.name(), item.type(), item.dates(), item.duration(), status, item.initials());
                            leaves.set(i, updated);
                            send(exchange, 200, "application/json", leaveJson(updated));
                            return;
                        }
                    }
                }
                send(exchange, 404, "application/json", "{\"error\":\"Leave request not found\"}");
                return;
            }
        }
        send(exchange, 405, "application/json", "{\"error\":\"Method not allowed\"}");
    }

    private static void serveStatic(HttpExchange exchange) throws IOException {
        String requested = exchange.getRequestURI().getPath();
        if (requested.equals("/")) requested = "/index.html";
        Path publicRoot = Path.of("public").toAbsolutePath().normalize();
        Path file = publicRoot.resolve(requested.substring(1)).normalize();
        if (!file.startsWith(publicRoot) || !Files.isRegularFile(file)) {
            send(exchange, 404, "text/plain", "Not found");
            return;
        }
        String mime = requested.endsWith(".css") ? "text/css" : requested.endsWith(".js") ? "application/javascript" : "text/html";
        send(exchange, 200, mime, Files.readString(file, StandardCharsets.UTF_8));
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        try (InputStream input = exchange.getRequestBody()) { return new String(input.readAllBytes(), StandardCharsets.UTF_8); }
    }

    private static String value(String json, String key) {
        Matcher matcher = Pattern.compile("\\\"" + Pattern.quote(key) + "\\\"\\s*:\\s*\\\"((?:\\\\.|[^\\\"])*)\\\"").matcher(json);
        return matcher.find() ? matcher.group(1).replace("\\\"", "\"").replace("\\\\", "\\") : "";
    }

    private static String initials(String name) {
        String[] parts = name.trim().split("\\s+");
        return (parts[0].substring(0, 1) + (parts.length > 1 ? parts[parts.length - 1].substring(0, 1) : "")).toUpperCase();
    }

    private static void send(HttpExchange exchange, int status, String type, String content) throws IOException {
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", type + "; charset=utf-8");
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream output = exchange.getResponseBody()) { output.write(bytes); }
    }

    private static String q(String text) { return "\"" + text.replace("\\", "\\\\").replace("\"", "\\\"") + "\""; }
    private static String employeeJson(Employee e) { return "{\"id\":" + e.id() + ",\"name\":" + q(e.name()) + ",\"role\":" + q(e.role()) + ",\"department\":" + q(e.department()) + ",\"location\":" + q(e.location()) + ",\"initials\":" + q(e.initials()) + ",\"status\":" + q(e.status()) + "}"; }
    private static String leaveJson(Leave l) { return "{\"id\":" + l.id() + ",\"name\":" + q(l.name()) + ",\"type\":" + q(l.type()) + ",\"dates\":" + q(l.dates()) + ",\"duration\":" + q(l.duration()) + ",\"status\":" + q(l.status()) + ",\"initials\":" + q(l.initials()) + "}"; }
    private static String employeesJson() { return "[" + employees.stream().map(PeopleFlowServer::employeeJson).reduce((a, b) -> a + "," + b).orElse("") + "]"; }
    private static String leavesJson() { return "[" + leaves.stream().map(PeopleFlowServer::leaveJson).reduce((a, b) -> a + "," + b).orElse("") + "]"; }

    record Employee(int id, String name, String role, String department, String location, String initials, String status) {}
    record Leave(int id, String name, String type, String dates, String duration, String status, String initials) {}
}
