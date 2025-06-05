# --- outputs.tf ---

output "gke_cluster_name" {
  description = "The name of the GKE cluster (fetched as data)"
  value       = data.google_container_cluster.primary.name
}

output "gke_node_pool_name" {
  description = "The name of the primary node pool. (Only valid if node pool resource is managed)"
  # If you removed the google_container_node_pool.primary_nodes resource, remove this output.
  value       = google_container_node_pool.primary_nodes.name
}

output "artifact_registry_url" {
  description = "The URL of the Artifact Registry Docker repository (fetched as data)"
  value       = "${data.google_artifact_registry_repository.docker_repo.location}-docker.pkg.dev/${var.project_id}/${data.google_artifact_registry_repository.docker_repo.repository_id}"
}

output "genui_namespace_name" { # Updated output name
  description = "The name of the genui Kubernetes namespace" # Updated description
  value       = kubernetes_namespace.irmai-genui.metadata[0].name # Reference the genui namespace resource
}

output "genui_service_external_ip" { # Updated output name
  description = "The external IP address of the irmai-genui-service LoadBalancer. May take a few minutes to become available." # Updated description
  # Uses try() to prevent errors if the IP is not immediately available during 'terraform plan' or early 'apply'.
  # The value will be "pending" until the LoadBalancer is fully provisioned and has an IP.
  value       = try(kubernetes_service.irmai-genui-service.status[0].load_balancer[0].ingress[0].ip, "pending") # Reference the irmai-genui-service resource
}