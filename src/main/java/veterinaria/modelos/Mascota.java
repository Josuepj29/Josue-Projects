package veterinaria.modelos;

public class Mascota {
    private String id;
    private String nombre;
    private String raza;
    private String especie;
    private int edad;
    private String sexo;

    public Mascota(String id, String nombre, String raza, String especie, int edad, String sexo) {
        this.id = id;
        this.nombre = nombre;
        this.raza = raza;
        this.especie = especie;
        this.edad = edad;
        this.sexo = sexo;
    }

    // Getters y Setters
    public String getId() { return id; }
    public String getNombre() { return nombre; }
    public String getRaza() { return raza; }
    public String getEspecie() { return especie; }
    public int getEdad() { return edad; }
    public String getSexo() { return sexo; }
}
