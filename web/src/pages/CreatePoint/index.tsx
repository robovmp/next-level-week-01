import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import api from "../../services/api";
import axios from "axios";

import Dropzone from "../../components/Dropzone";

import './style.css';
import logo from '../../assets/logo.svg';
import { FiArrowLeft } from "react-icons/fi";

interface Item{
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse{
    nome: string;
}

// 33:36

const CreatPoint = () =>{

    const [ items, setItems ] = useState< Item[] >( [] );

    const [ ufs, setUfs ] = useState< string[] >( [] );

    const [ cities, setCities ] = useState< string[] >( [] );

    const [ selectedUf, setSelectedUf ] = useState('0');

    const [ selectedCity, setSelectedCity ] = useState('0');

    const [ initialPosition, setInitialPosition ] = useState<[number, number]>( [-23.2939436, -50.0799876] );

    const [ formData, setFormData ] = useState( {
        name: '',
        email: '',
        whatsapp: '',
    } );

    const [ selectedItems, setSelectedItems ] = useState<number[]>( [] );

    const [ selectedPosition, setSelectedPosition ] = useState<[number, number]>( [ 0, 0 ] );

    const [ selectedFile, setSelectedFile ] = useState<File>();

    const history = useNavigate();

    useEffect(
        ()=>{
            navigator.geolocation.getCurrentPosition(
                position =>{                    
                    
                    const { latitude, longitude } = position.coords;

                    setInitialPosition( [latitude, longitude] );
                }
            )
        }, []
    );

    useEffect( 
        ()=>{
            api.get( 'items' )
                .then( response =>{
                    setItems( response.data );
                } 
            );
        }, []
    );

    useEffect( 
        ()=>{
            axios.get<IBGEUFResponse[]>( 'https://servicodados.ibge.gov.br/api/v1/localidades/estados' )
                .then(
                    response =>{
                        const ufInitials = response.data.map( uf => uf.sigla );

                        setUfs( ufInitials );
                    }
                )
            
        }, []
     );

     useEffect(
        ()=>{
            if( selectedUf === '0' ){
                return;
            }
            axios.get<IBGECityResponse[]>( `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios` )
                .then(
                    
                    response =>{
                        const cityNames = response.data.map( city => city.nome );
                        setCities( cityNames );
                    }
                )
        },[selectedUf]
     );
      

    function handleSelectUf( event: ChangeEvent<HTMLSelectElement> ){
        const uf = event.target.value
        setSelectedUf( uf );
    }

    function handleSelectCity( event: ChangeEvent<HTMLSelectElement> ){
        const city = event.target.value
        setSelectedCity( city );
    }

    function HandleMapClick(){
        useMapEvents( { 
            click:  (e) =>{
                setSelectedPosition( [
                    e.latlng.lat,
                    e.latlng.lng
                ] )
            }   
        } );

        return null;
    }
    
    function handleInputChange( event: ChangeEvent<HTMLInputElement> ){

        const { name, value } = event.target;

        setFormData( { ...formData, [name]: value } );
    }

    function handleSelectItem(id: number){

        const alreadySelected = selectedItems.findIndex( item => item === id );

        if ( alreadySelected >= 0 ) {
            const filteredItems = selectedItems.filter( item => item !== id );

            setSelectedItems( filteredItems );
        } else {
            setSelectedItems( [...selectedItems, id] );
        }
        
    }

    async function handleSubmit( event: FormEvent ) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [ latitude, longitude ] =selectedPosition;
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude) );
        data.append('longitude', String(longitude) );
        data.append('items', items.join(','));
        
        if (selectedFile) {
            data.append('image', selectedFile);
        }
       

        await api.post( 'points', data );

        alert('Cadastro realizado com sucesso!')

        history( '/' )

    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit} >
                <h1>Cadastro do <br/> ponto de coleta</h1>
                
                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text" 
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email" 
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="field">
                        <label htmlFor="whatsapp">Whatsapp</label>
                        <input 
                            type="text" 
                            name="whatsapp"
                            id="whatsapp"
                            onChange={handleInputChange}
                        />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    
                    <MapContainer center={initialPosition} zoom={15}>
                        <TileLayer
                            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"                           
                        />
                        <HandleMapClick />
                        <Marker position={selectedPosition} />
                    </MapContainer>

                    <div className="field-group">

                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf"  
                                id="uf" 
                                value={selectedUf}
                                onChange={handleSelectUf} 
                            >
                                <option value="0">Selecione uma UF</option>

                                {
                                    ufs.map( uf =>(
                                        <option value={uf} key={uf}> {uf} </option>
                                    ) )
                                }
                                
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city"  
                                id="city"
                                onChange={handleSelectCity}
                                value={selectedCity}
                            >
                                <option value="0">Selecione uma cidade</option>

                                {
                                    cities.map( city =>(
                                        <option value={city} key={city}> {city} </option>
                                    ) )
                                }

                            </select>
                        </div>

                    </div>

                </fieldset>

                <fieldset>
                    
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens de coleta</span>
                    </legend>

                    <ul className="items-grid">
                        {
                            items.map( items =>(
                                <li 
                                    key={items.id} 
                                    onClick={ ()=> handleSelectItem(items.id)} 
                                    className={selectedItems.includes(items.id) ? 'selected' : '' }
                                >
                                    <img src={items.image_url} alt={items.title} />
                                    <span>{items.title}</span>
                                </li> 

                            ) )
                        }
                                               

                    </ul>

                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
}

export default CreatPoint;