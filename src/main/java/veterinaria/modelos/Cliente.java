package veterinaria.modelos;

import java.util.ArrayList;
import java.util.List;

public class Cliente {
    private String nombre;
    private String apellido;
    private String telefono;
    private String direccion;
    private String observacion;
    private List<Mascota> mascotas;

    public Cliente(String nombre, String apellido, String telefono, String direccion, String observacion) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.direccion = direccion;
        this.observacion = observacion;
        this.mascotas = new ArrayList<>();
    }

    // Getters y Setters
    public String getNombre() { return nombre; }
    public String getApellido() { return apellido; }
    public String getTelefono() { return telefono; }
    public String getDireccion() { return direccion; }
    public String getObservacion() { return observacion; }
    public List<Mascota> getMascotas() { return mascotas; }

    public void agregarMascota(Mascota mascota) {
        mascotas.add(mascota);
    }
}
