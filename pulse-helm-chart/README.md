# Pulse Performance Management Helm Chart

This Helm chart deploys the Pulse Performance Management System, including:
- **pulse-java-api**: Spring Boot REST and GraphQL API
- **pulse-agent-ai**: FastAPI AI Agent service

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- PostgreSQL database (can be deployed with this chart or use external)
- Redis cache (can be deployed with this chart or use external)
- Docker images available at `sidgs.jfrog.io/sidgs/`

## Installation

### Quick Start

```bash
# Install with default values
helm install pulse-performance-management ./pulse-helm-chart

# Install with custom values file
helm install pulse-performance-management ./pulse-helm-chart -f my-values.yaml

# Install with custom values
helm install pulse-performance-management ./pulse-helm-chart \
  --set secrets.javaApi.databasePassword=myPassword \
  --set secrets.agentAi.googleApiKey=myApiKey
```

### Using External Database and Redis

If you have external PostgreSQL and Redis instances, disable the included ones:

```yaml
postgresql:
  enabled: false

redis:
  enabled: false
```

Then update the connection settings in `values.yaml`:

```yaml
javaApi:
  config:
    database:
      host: your-postgres-host
      port: 5432
      name: your_database
      username: your_username
```

## Configuration

### Key Configuration Options

#### Java API Configuration

```yaml
javaApi:
  enabled: true
  replicaCount: 2
  image:
    repository: pulse-java-api
    tag: latest
  config:
    springProfilesActive: prod
    database:
      type: postgresql
      host: postgresql
      port: 5432
      name: performance_management
    redis:
      host: redis
      port: 6379
```

#### Agent AI Configuration

```yaml
agentAi:
  enabled: true
  replicaCount: 2
  image:
    repository: pulse-agent-ai
    tag: latest
  config:
    database:
      host: postgresql
      port: 5432
      name: pulse_agent_sessions
    graphqlApiUrl: http://pulse-java-api:8080/api/v1/epm/graphql
    googleCloud:
      project: your-gcp-project
      apiKey: your-api-key
```

### Secrets Management

**Important**: Set all secrets before deploying. You can do this via:

1. **Values file** (not recommended for production):
```yaml
secrets:
  javaApi:
    databasePassword: "base64encodedpassword"
    redisPassword: "base64encodedpassword"
  agentAi:
    databasePassword: "base64encodedpassword"
    googleCloudProject: "base64encodedproject"
    googleApiKey: "base64encodedkey"
    jwtSecretKey: "base64encodedsecret"
```

2. **Helm --set flags**:
```bash
helm install pulse-performance-management ./pulse-helm-chart \
  --set secrets.javaApi.databasePassword=$(echo -n 'mypassword' | base64) \
  --set secrets.agentAi.googleApiKey=$(echo -n 'myapikey' | base64)
```

3. **External Secrets** (recommended for production):
   - Use a secrets management tool like Sealed Secrets, External Secrets Operator, or Vault
   - Create secrets manually and reference them in values.yaml

### Ingress Configuration

To enable ingress:

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: performance-management.example.com
      paths:
        - path: /api/v1/epm
          pathType: Prefix
          service: pulse-java-api
        - path: /api/v1/pulse-epm-agent
          pathType: Prefix
          service: pulse-agent-ai
  tls:
    - secretName: performance-management-tls
      hosts:
        - performance-management.example.com
```

### Autoscaling

Enable horizontal pod autoscaling:

```yaml
javaApi:
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 5
    targetCPUUtilizationPercentage: 80
    targetMemoryUtilizationPercentage: 80
```

## Values Reference

| Parameter | Description | Default |
|-----------|-------------|---------|
| `javaApi.enabled` | Enable Java API deployment | `true` |
| `javaApi.replicaCount` | Number of Java API replicas | `2` |
| `javaApi.image.repository` | Java API image repository | `pulse-java-api` |
| `javaApi.image.tag` | Java API image tag | `latest` |
| `javaApi.config.database.type` | Database type (postgresql/sqlite) | `postgresql` |
| `agentAi.enabled` | Enable Agent AI deployment | `true` |
| `agentAi.replicaCount` | Number of Agent AI replicas | `2` |
| `agentAi.image.repository` | Agent AI image repository | `pulse-agent-ai` |
| `agentAi.image.tag` | Agent AI image tag | `latest` |
| `postgresql.enabled` | Deploy PostgreSQL | `true` |
| `redis.enabled` | Deploy Redis | `true` |
| `ingress.enabled` | Enable ingress | `false` |

See `values.yaml` for all available options.

## Upgrading

```bash
# Upgrade with new values
helm upgrade pulse-performance-management ./pulse-helm-chart -f my-values.yaml

# Upgrade with new image tag
helm upgrade pulse-performance-management ./pulse-helm-chart \
  --set javaApi.image.tag=v1.1.0 \
  --set agentAi.image.tag=v1.1.0
```

## Uninstallation

```bash
helm uninstall pulse-performance-management
```

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -l app.kubernetes.io/instance=pulse-performance-management
```

### View Logs

```bash
# Java API logs
kubectl logs -l app.kubernetes.io/name=pulse-java-api

# Agent AI logs
kubectl logs -l app.kubernetes.io/name=pulse-agent-ai
```

### Check Services

```bash
kubectl get svc -l app.kubernetes.io/instance=pulse-performance-management
```

### Port Forward for Testing

```bash
# Java API
kubectl port-forward svc/pulse-java-api 8080:8080

# Agent AI
kubectl port-forward svc/pulse-agent-ai 8000:8000
```

## Production Considerations

1. **Secrets Management**: Use a proper secrets management solution (Vault, Sealed Secrets, etc.)
2. **Resource Limits**: Adjust resource requests/limits based on your workload
3. **Persistence**: Ensure PostgreSQL persistence is configured for production data
4. **Backup**: Set up regular backups for PostgreSQL
5. **Monitoring**: Add Prometheus metrics and monitoring
6. **Network Policies**: Implement network policies for security
7. **Image Pull Secrets**: Configure image pull secrets for private registry access

## License

See LICENSE file in the project root.

