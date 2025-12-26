{{/*
Expand the name of the chart.
*/}}
{{- define "pulse-performance-management.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "pulse-performance-management.fullname" -}}
{{- if .Values.nameOverride }}
{{- .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "pulse-performance-management.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "pulse-performance-management.labels" -}}
helm.sh/chart: {{ include "pulse-performance-management.chart" . }}
{{ include "pulse-performance-management.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "pulse-performance-management.selectorLabels" -}}
app.kubernetes.io/name: {{ include "pulse-performance-management.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Java API labels
*/}}
{{- define "pulse-performance-management.javaApi.labels" -}}
helm.sh/chart: {{ include "pulse-performance-management.chart" . }}
app.kubernetes.io/name: {{ .Values.javaApi.name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: java-api
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Java API selector labels
*/}}
{{- define "pulse-performance-management.javaApi.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.javaApi.name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: java-api
{{- end }}

{{/*
Agent AI labels
*/}}
{{- define "pulse-performance-management.agentAi.labels" -}}
helm.sh/chart: {{ include "pulse-performance-management.chart" . }}
app.kubernetes.io/name: {{ .Values.agentAi.name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: agent-ai
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Agent AI selector labels
*/}}
{{- define "pulse-performance-management.agentAi.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.agentAi.name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: agent-ai
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "pulse-performance-management.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "pulse-performance-management.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Image registry
*/}}
{{- define "pulse-performance-management.imageRegistry" -}}
{{- if .Values.global.imageRegistry }}
{{- .Values.global.imageRegistry }}
{{- else }}
{{- .Values.imageRegistry }}
{{- end }}
{{- end }}

